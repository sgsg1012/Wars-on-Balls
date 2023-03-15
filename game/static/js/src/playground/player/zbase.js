class Player extends AcGameObject{
    constructor(playground,x,y,radius,color,speed,is_me){
        super();
        this.playground=playground;
        this.ctx=this.playground.game_map.ctx;
        this.x=x;
        this.y=y;
        this.direction=0;
        this.move_length=0;
        this.radius=radius;
        this.speed=speed;
        this.color=color;
        this.is_me=is_me;
        this.eps=0.1;
    }
    start(){
        if (this.is_me) {
            this.add_listening_events();
        }
    }
    update(){
        if(this.move_length<this.eps){
            this.move_length=0;
            this.direction=0;
        }else{
            let moved = Math.min(this.move_length,this.speed * this.timedelta / 1000);
            this.x += moved * Math.cos(this.direction);
            this.y += moved * Math.sin(this.direction);
            this.move_length -= moved;
        }
        this.render();
    }
    add_listening_events(){
        let outer = this;
        this.playground.game_map.$canvas.mousedown(function(e) {
            if (e.which === 3) {
                outer.move_to(e.clientX, e.clientY);
            }
        });
    }
    get_distance(x1,y1,x2,y2){
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }
    move_to(x,y){
        this.move_length=this.get_distance(this.x,this.y,x,y);
        this.direction = Math.atan2(y-this.y,x-this.x);
    }
    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}