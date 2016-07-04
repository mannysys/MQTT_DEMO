'use strict';
var mosca = require('mosca');
var auth = new mosca.Authorizer(); //角色验证控制

// 配置mosca(Server方式)
var settings = {
    port: 7410
}; 
//配置http是网页方式客户端
settings = {
    http:{
        port: 7410,
        bundle: true //提供给网页客户端的mqtt.js
    }
};

//模拟用户数据
var users = [{
    userId: 1,
    username: 'jay',
    password: 'pass',
    publishTopics: ['abc','abc/e'],
    subscribeTopics: ['abc', 'test']
}];
//存储连接用户数据
var userMap = new Map();
//自定义权限控制
var authenticate = (client, username, password, callback) => {
    var user = users.find(x => x.username === username.toString() && x.password === password.toString());
    if(!user){
        return callback('User not found.', false);
    }
    userMap.set(client.id, {
        userId: user.userId,
        publishTopics: user.publishTopics,
        subscribeTopics: user.subscribeTopics
    });
    callback(null, true);
};
//发布权限验证
var authorizePublish = (client, topic, payload, callback) => {
    var user = userMap.get(client.id);
    if(!user){
        return callback('User invalid', false);
    }
    if(user.publishTopics.indexOf(topic) < 0){
        return callback(`Can't public topic：{$topic}`);
    }
    callback(null, true);
};
//订阅权限验证
var authorizeSubscribe = (client, topic, callback) => {
     var user = userMap.get(client.id);
    if(!user){
        return callback('User invalid', false);
    }
    if(user.subscribeTopics.indexOf(topic) < 0){
        return callback(`Can't public topic：{$topic}`);
    }
    callback(null, true);
};


// 创建Server
var server = new mosca.Server(settings);

// 服务端准备好之后触发
server.on('ready', () => {
    console.log('MQTT server started');
    //权限验证
    server.authenticate = authenticate;
    server.authorizePublish = authorizePublish; //发布的时候要验证
    server.authorizeSubscribe = authorizeSubscribe; //订阅的时候要验证
    console.log('Authorize is ready');
    
    
    //控制发布'test\/*'，第四个参数控制订阅
    // auth.addUser('jay','pass', 'test\/*','test\/*', (err) => {
    //     if(err){
    //         console.error(err);
    //     }
    //     console.log('Add user succeed');
    //     //移除掉用户验证
    //     // auth.rmUser('jay', () => {
    //     //     console.log('Remove user succeed');
    //     // });
    // });
    
});
// 服务端出现Error时触发
server.on('server', (err) => {
    console.log('error', err);
});

// 客户端连接成功之后触发
server.on('clientConnected', (client) => {
    console.log('client connected, client id is', client.id);
});
// 客户端断开连接之后触发
server.on('clientDisconnected', (client) => {
    console.log('client disconnected, client id is', client.id);

    userMap.delete(client.id);
    console.log('userMap size', userMap.size); 

});

// 发布
server.on('published', (packet, client) => {
    //console.log(client.id, ' published data:', packet);
});
// 订阅
server.on('subscribed', (topic, client) => {
    console.log(client.id, ' subscribed topic:', topic);
});
// 取消订阅
server.on('unsubscribed', (topic, client) => {
    console.log(client.id, ' unsubscribed topic:', topic);
});