class Player extends AcGameObject{
    constructor(playground,x,y,radius,color,speed,is_me){
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
        this.is_me=is_me; // 小球是否是自己
        this.eps=0.1; //误差 
        // 被攻击的强制移动
        this.damage_x=0;
        this.damage_y=0;
        this.damage_speed=0;
        this.friction=0.9; // 摩擦力
        this.spendtime=0;
        this.alive=true;

        // 加载用户头像
        if(this.is_me){
            this.img = new Image();
            this.img.src = this.playground.root.settings.photo;
        }
    }
    start(){
        if (this.is_me) { // 给自己的小球绑定一些监听事件
            this.add_listening_events();
        }else{
            let tx = Math.random() * this.playground.$playground.width();
            let ty = Math.random() * this.playground.$playground.height();
            this.move_to(tx, ty);
        }
    }
    update(){
        this.spendtime += this.timedelta / 1000;
        // 人机自动攻击
        if(this.alive && !this.is_me && this.spendtime > 3 &&  Math.random() < 1.0/300){
            let tag = false;
            for(let i=0;i<this.playground.players.length;i++)
            {
                if(this.playground.players[i].is_me){
                    this.shoot_fireball(this.playground.players[i].x,this.playground.players[i].y);
                    tag = true;
                    break;
                }
            }
            if(!tag){
                let player = this.playground.players[Math.floor(Math.random()*this.playground.players.length)];
                this.shoot_fireball(player.x,player.y);
            }
        }

        if(this.damage_speed > 10){
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;

        }else{
            if(this.move_length<this.eps){ // 移动距离为0 停止移动
                this.move_length=0;
                this.direction_x=this.direction_y=0;
                if(!this.is_me)
                {
                    let tx = Math.random() * this.playground.$playground.width();
                    let ty = Math.random() * this.playground.$playground.height();
                    this.move_to(tx, ty);
                }
            }else{ // 移动
                // 两帧之间小球的移动距离
                let moved = Math.min(this.move_length,this.speed * this.timedelta / 1000);
                this.x += moved * this.direction_x;
                this.y += moved * this.direction_y;
                // 别忘了减去已经移动的距离
                this.move_length -= moved;
            }
        } 
        // 渲染
        this.render();
    }
    add_listening_events(){
        let outer = this;
        // 鼠标左键 控制移动
        this.playground.game_map.$canvas.mousedown(function(e) {
            if (outer.alive && e.which === 1) {
                const rect = outer.ctx.canvas.getBoundingClientRect();
                outer.move_to(e.clientX-rect.left, e.clientY-rect.top);
            }
        });
        // 监听键盘事件 发技能 技能的方向为当前鼠标的位置与自己位置的夹角
        $(window).keydown(function(e){
            if(outer.alive && e.which === 81) { // 监听q键 发火球
                const rect = outer.ctx.canvas.getBoundingClientRect();
                let tx=outer.playground.mouse_x;
                let ty=outer.playground.mouse_y;
                outer.shoot_fireball(tx-rect.left,ty-rect.top);
                outer.move_length=0;
                outer.direction_x=0;
                outer.direction_y=0;
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
        if (this.radius < 1) { 
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
    shoot_fireball(tx, ty) {
        console.log(this.playground.players.length);
        let x = this.x, y = this.y;
        let radius = this.playground.$playground.height() * 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed = this.playground.$playground.height() * 0.5;
        let move_length = this.playground.$playground.height() * 1;
        let damage = this.playground.$playground.height() * 0.01;
        new FireBall(this.playground, this, x, y, vx, vy, radius, color, speed, move_length, damage);
    }
    // 渲染
    render(){
        if(this.is_me){
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2); 
            this.ctx.restore();
        }
        else{
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
    }
    on_destroy(){
        for(let i=0; i < this.playground.players.length; i++){
            if(this.playground.players[i] === this) {
                this.playground.players.splice(i,1);
                break;
            }
        }
    }
}