'use strict';

var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://localhost:7410');

//主题树
var topic = 'sys/log/now'; 

client.on('connect', function(){
    console.log('Client connect to mqtt server succeed');

    //订阅数据
    client.subscribe('sys/log/now');

    //发布数据
    setInterval(() => {
        client.publish(topic, Date.now().toString());
        // client.end(); //连接关闭
    },1000);
    
});

//处理订阅数据
client.on('message', (topic, message) => {
    console.log(topic, message.toString());
});

//重新连接时触发
client.on('reconnect', () => {
    console.log('Event：reconnect');
});
//连接关闭时触发
client.on('close', () => {
    console.log('Event：close');
});
//连接错误时触发
client.on('error', (err) => {
    console.log('Event：error', err);
});

client.on('offline', () => {
    console.log('Event：offline');
});











