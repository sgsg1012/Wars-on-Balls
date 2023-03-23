class MultiPlayerSocket{
    constructor(playground){
        this.playground=playground;
        this.ws = new WebSocket("wss://app907.acapp.acwing.com.cn/wss/multiplayer/");
        this.uuid = this.create_uuid();
        this.start();
    }
    create_uuid() {
        let res = "";
        for (let i = 0; i < 8; i ++ ) {
            let x = parseInt(Math.floor(Math.random() * 10));  // 返回[0, 10)之间的数
            res += x;
        }
        return res;
    }
    start(){
        let outer = this;
        this.ws.onmessage = function(e){
            let data = JSON.parse(e.data);
            let event = data.event;
            if(event === "create_player"){
                outer.receive_create_player(data.uuid,data.username,data.photo);
            }else if(event === "move_to"){
                outer.receive_move_to(data.uuid,data.tx,data.ty);
            }else if(event === "shoot_fireball"){
                outer.receive_shoot_fireball(data.uuid,data.tx,data.ty);
            }else if(event === "is_attacked"){
                outer.receive_is_attacked(data.uuid, data.angle, data.damage);
            }else if(event === "blink"){
                outer.receive_blink(data.uuid, data.tx, data.ty);
            }
        }
    }
    // create player
    send_create_player(uuid, username, photo){
        this.ws.send(JSON.stringify({
            'event': "create_player",
            'uuid': uuid,
            'username': username,
            'photo': photo,
        }));
    }
    receive_create_player(uuid, username, photo){
        let player;
        if(uuid === this.uuid) { // 自己
            player = new Player(this.playground,this.playground.width / 2 / this.playground.scale,0.5,0.05,"white",0.5,"me",username,photo);
        }
        else{ // 敌人
            player = new Player(this.playground,this.playground.width / 2 / this.playground.scale, 0.5,0.05,"white",0.5,"enemy",username,photo);
        }
        player.uuid = uuid; // 以服务器端的uuid为准
        this.playground.players.push(player);
    }

    // move to
    send_move_to(uuid,tx,ty){
        this.ws.send(JSON.stringify({
            'event': "move_to",
            'uuid': uuid,
            'tx': tx,
            'ty': ty,
        }));
    }
    get_player(uuid){
        for(let i = 0;i<this.playground.players.length;i++){
            let player = this.playground.players[i];
            if(player.uuid === uuid) return player;
        }
    }
    receive_move_to(uuid, tx, ty){
        let player = this.get_player(uuid);
        if(player) player.move_to(tx,ty);
    }

    // shoot fireball
    send_shoot_fireball(uuid,tx,ty){
        this.ws.send(JSON.stringify({
            'event': "shoot_fireball",
            'uuid': uuid,
            'tx': tx,
            'ty': ty,
        }));
    }
    receive_shoot_fireball(uuid, tx, ty){
        let player = this.get_player(uuid);
        if(player) player.shoot_fireball(tx,ty);
    }

    // is attacked
    send_is_attacked(uuid, angle, damage){
        this.ws.send(JSON.stringify({
            'event': "is_attacked",
            'uuid': uuid,
            'angle': angle,
            'damage': damage,
        }));
    }
    receive_is_attacked(uuid, angle, damage){
        let player = this.get_player(uuid);
        if(player) player.is_attacked(angle,damage);
    }
    // blink
    send_blink(uuid, tx, ty){
        this.ws.send(JSON.stringify({
            'event': "blink",
            'uuid': uuid,
            'tx': tx,
            'ty': ty,
        }));
    }
    receive_blink(uuid, tx, ty){
        let player = this.get_player(uuid);
        if(player) player.blink(tx,ty);
    }
    send_dead(uuid){
        this.ws.send(JSON.stringify({
            'event': "dead",
            'uuid': uuid,
        }));
    }
}
