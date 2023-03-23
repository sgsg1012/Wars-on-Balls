# django学习项目

## django 新建表
+ 在models文件夹里面新建python文件
+ 在admin.py 文件中把表注册到admin页面中，这样就可以在admin页面看到自己的表
+ 执行命令 python3 manage.py makemigrations python3 manage.py migrate

## http 单向协议
## websocker 双向协议
## 联机攻击判定机制
在客户端判定，优化用户体验
以攻击方判定为准，攻击方发现自己击中目标后通过服务器通知被攻击方 

## 多人模式游玩机制
在多人模式中，玩家的操作不会立刻发生，而是会传给服务器，再由服务器传给玩家进行操作，这样做的好处是如果玩家意外掉线，将无法操作自己的角色，会立刻感知到自己网络情况不佳(类似荒野乱斗红wifi)
这样为了区分自己和其他玩家，把multi_player_socket的uuid设置为自己的uuid

