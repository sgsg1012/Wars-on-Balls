class Player extends AcGameObject{
    constructor(playground,x,y,radius,color,speed,character,username,photo){
        // console.log(username);
        super();
        this.playground=playground;
        this.ctx=this.playground.game_map.ctx;
        // 移动位置 和 移动距离
        this.direction_x=0;
        this.direction_y=0;
        this.move_length=0;
        // 小球信息
        this.x=x;
        this.y=y;
        this.radius=radius;
        this.speed=speed;
        this.color=color;
        this.character=character; // 小球角色 三种 自己 敌人 机器人
        this.username=username; // 角色信息 机器人不填
        this.photo=photo; 
        this.eps=0.01; //误差 
        // 被攻击的强制移动
        this.damage_x=0;
        this.damage_y=0;
        this.damage_speed=0;
        this.friction=0.9; // 摩擦力
        this.spendtime=0;
        this.alive=true;
        this.skill="";

        // 加载用户头像
        if(this.character !== "robot"){
            this.img = new Image();
            this.img.src = this.photo;
        }

        if (this.character === "me") {
            this.fireball_coldtime = 3;  // 单位：秒
            this.fireball_img = new Image();
            this.fireball_img.src = "https://app907.acapp.acwing.com.cn/static/image/playground/fireball.png";

            this.blink_coldtime = 5;  // 单位：秒
            this.blink_img = new Image();
            this.blink_img.src = "https://app907.acapp.acwing.com.cn/static/image/playground/blink.png";
        }
    }
    start(){
        if (this.character === "me") { // 给自己的小球绑定一些监听事件
            this.add_listening_events();
        }else if(this.character === "robot") { // 人机自动移动
            let tx = Math.random() * this.playground.width / this.playground.scale;
            let ty = Math.random() * this.playground.height / this.playground.scale;
            this.move_to(tx, ty);
        }
    }
    update(){
        this.spendtime += this.timedelta / 1000;
        this.fireball_coldtime -= this.timedelta / 1000;
        this.fireball_coldtime = Math.max(0, this.fireball_coldtime);
        this.blink_coldtime -= this.timedelta / 1000;
        this.blink_coldtime = Math.max(0,this.blink_coldtime);
        // 人机自动攻击
        this.update_attack();
        // 更新位置
        this.update_position();
        // 渲染
        this.render();
    }
    update_attack(){
        // 人机自动攻击
        if(this.alive && this.character === "robot" && this.spendtime > 3 &&  Math.random() < 1.0/300){
            let tag = false;
            for(let i=0;i<this.playground.players.length;i++)
            {
                if(this.playground.players[i].character !== "robot"){ // 有用户时机器人不会自相残杀
                    this.shoot_fireball(this.playground.players[i].x,this.playground.players[i].y);
                    tag = true;
                    break;
                }
            }
            if(!tag){
                let player = this.playground.players[Math.floor(Math.random()*this.playground.players.length)];
                this.shoot_fireball(player.x, player.y);
            }
        }
    }
    update_position(){
        if(this.damage_speed > this.eps){
            this.direction_x = this.direction_y = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        }else{
            if(this.move_length < this.eps){ // 移动距离为0 停止移动
                this.move_length=0;
                this.direction_x=this.direction_y=0;
                if(this.character === "robot") // 人机自动移动
                {
                    let tx = Math.random() * this.playground.width / this.playground.scale;
                    let ty = Math.random() * this.playground.height / this.playground.scale;
                    this.move_to(tx, ty);
                }
            }else{ // 移动
                // 两帧之间小球的移动距离
                let moved = Math.min(this.move_length ,this.speed * this.timedelta / 1000);
                this.x += moved * this.direction_x;
                this.y += moved * this.direction_y;
                // 别忘了减去已经移动的距离
                this.move_length -= moved;
            }
        } 
    }
    add_listening_events(){
        let outer = this;
        
        this.playground.game_map.$canvas.mousedown(function(e) {
            if(outer.alive){
                if (e.which === 1) { // 鼠标左键 控制移动
                    const rect = outer.ctx.canvas.getBoundingClientRect();
                    let tx = (e.clientX-rect.left) / outer.playground.scale;
                    let ty = (e.clientY-rect.top) / outer.playground.scale;
                    if(outer.playground.mode === "multi mode"){ // 多人模式
                        outer.playground.multi_player_socket.send_move_to(outer.uuid,tx,ty);
                    }else{
                        outer.move_to(tx,ty);
                    }
                }else if(e.which === 3){ // 鼠标右键 控制闪现
                    if(outer.skill === "blink"){
                        const rect = outer.ctx.canvas.getBoundingClientRect();
                        let tx = (e.clientX-rect.left) / outer.playground.scale;
                        let ty = (e.clientY-rect.top) / outer.playground.scale;
                        if(outer.playground.mode === "multi mode"){ // 多人模式
                            outer.playground.multi_player_socket.send_blink(outer.uuid,tx,ty);
                        }else{ // 单人模式
                            outer.blink(tx,ty);
                        }
                        outer.skill = "";
                        outer.blink_coldtime = 5.0;
                    }
                }
            }
        });
        // 监听键盘事件 发技能 技能的方向为当前鼠标的位置与自己位置的夹角
        $(window).keydown(function(e){
            if(outer.alive){ // 活着才能发技能
                if(e.which === 81) { // 监听q键 发火球
                    if(outer.fireball_coldtime < outer.eps){ // 技能cd
                        const rect = outer.ctx.canvas.getBoundingClientRect();
                        let tx=outer.playground.mouse_x;
                        let ty=outer.playground.mouse_y;
                        tx = (tx-rect.left)/outer.playground.scale;
                        ty = (ty-rect.top)/outer.playground.scale;
                        if(outer.playground.mode === "multi mode"){ // 多人模式
                            outer.playground.multi_player_socket.send_shoot_fireball(outer.uuid,tx,ty);
                        }else{
                            outer.shoot_fireball(tx,ty);
                        }
                        outer.fireball_coldtime = 3.0; // 重置冷却时间
                    }
                }else if(e.which === 70){ // f键 闪现
                    if(outer.blink_coldtime < outer.eps){ // 技能cd
                        outer.skill = "blink";
                    }
                }
            }
        });
    }
    is_attacked(angle, damage){
        // 被打动画 释放粒子
        for (let i = 0; i < 20 + Math.random() * 10; i ++ ) {
            let x = this.x, y = this.y;
            let radius = this.radius * Math.random() * 0.1;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 10;
            let move_length = this.radius * Math.random() * 3;
            new Particle(this.playground, x, y, radius, vx, vy, color, speed, move_length);
        }
        // 半径变小 速度变慢
        this.radius -= damage;
        this.speed *= 0.8;
        // 死亡
        if (this.radius < this.eps) { 
            this.alive=false;
            this.destroy();
            return false;
        }
        // 强制移动
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 100;
    }
    get_distance(x1,y1,x2,y2){
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }
    // 小球移动
    move_to(x,y){
        this.move_length=this.get_distance(this.x,this.y,x,y);
        let angle = Math.atan2(y-this.y,x-this.x);
        this.direction_x = Math.cos(angle);
        this.direction_y = Math.sin(angle);
    }
    shoot_fireball(tx, ty) { // 火球
        let x = this.x, y = this.y;
        let radius = 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed = 0.5;
        let move_length = 1;
        let damage = 0.01;
        new FireBall(this.playground, this, x, y, vx, vy, radius, color, speed, move_length, damage);
        // 发射技能时停止移动
        this.move_length=0;
        this.direction_x=0;
        this.direction_y=0;
    }
    blink(x, y){ // 闪现
        let length=Math.min(0.8,this.get_distance(this.x,this.y,x,y));
        let angle = Math.atan2(y-this.y,x-this.x);
        let nx = this.x + length * Math.cos(angle);
        let ny = this.y + length * Math.sin(angle);
        this.x=nx,this.y=ny;
        this.move_length=0; // 闪现后停止移动
    }
    // 渲染 技能图标
    render_skill_coldtime() {
        let scale = this.playground.scale;
        let x = 1.5, y = 0.9, r = 0.04;

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.fireball_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if (this.fireball_coldtime > this.eps) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.fireball_coldtime / 3) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }

        x = 1.62, y = 0.9, r = 0.04;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.blink_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if (this.blink_coldtime > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.blink_coldtime / 5) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }
    }
    // 渲染
    render(){
        let scale = this.playground.scale;

        if(this.character !== "robot"){
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale); 
            this.ctx.restore();
        }
        else{
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }

        if(this.character === "me"){
            this.render_skill_coldtime();
        }
    }
    on_destroy(){
        if(this.character === "me" && this.playground.mode === "multi mode"){
            this.playground.multi_player_socket.send_dead(this.uuid);
        }
        for(let i=0; i < this.playground.players.length; i++){
            if(this.playground.players[i] === this) {
                this.playground.players.splice(i,1);
                break;
            }
        }
    }
}