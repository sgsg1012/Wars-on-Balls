// 粒子类，玩家被攻击时会掉落粒子动画
class Particle extends AcGameObject{
    constructor(playground,x,y,radius,dx,dy,color,speed,move_length){
        super();
        this.playground=playground;
        this.ctx=this.playground.game_map.ctx;
        // 粒子信息
        this.x=x;
        this.y=y;
        this.dx=dx;
        this.dy=dy;
        this.move_length=move_length;
        this.radius=radius;
        this.speed=speed;
        this.color=color;
        this.friction=0.9;
        this.eps=0.01; // 误差
    }
    start(){
    }
    update(){
        if (this.move_length < this.eps || this.speed < this.eps) {
            this.destroy();
            return false;
        }

        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.dx * moved;
        this.y += this.dy * moved;
        this.speed *= this.friction;
        this.move_length -= moved;
        this.render();
    }
    render(){
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}