class FireBall extends AcGameObject{
    constructor(playground,player,x,y,dx,dy,radius,color,speed,move_length,damage){
        super();
        this.playground=playground;
        this.player=player;
        this.ctx=this.playground.game_map.ctx;
        // 火球信息
        this.x=x;
        this.y=y;
        this.direction_x=dx;
        this.direction_y=dy;
        this.move_length=move_length;
        this.radius=radius;
        this.speed=speed;
        this.color=color;
        this.damage=damage;
        this.eps=0.1; // 误差
    }
    start(){
    }
    update(){
        // 处理碰撞
        let players = this.playground.players;
        for(let i=0;i<players.length;i++){
            if(players[i] === this.player) continue;
            if(this.is_collision(players[i]))
            {
                this.attack(players[i]);
                this.destroy();
                return false;
            }
        }
        // 处理火球移动
        if(this.move_length<this.eps){
            this.destroy();
            return false;
        }else{
            let moved = Math.min(this.move_length,this.speed * this.timedelta / 1000);
            this.x += moved * this.direction_x;
            this.y += moved * this.direction_y;
            this.move_length -= moved;
        }
        this.render();
    }
    attack(player){
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.is_attacked(angle, this.damage);
        this.destroy();
        return false;
    }
    get_distance(x1,y1,x2,y2){
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }
    is_collision(obj)
    {
        let distance = this.get_distance(this.x,this.y,obj.x,obj.y);
        return distance < this.radius + obj.radius;
    }
    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}