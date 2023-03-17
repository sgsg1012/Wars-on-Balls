class GameMap extends AcGameObject{
    constructor(playground){
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.$playground.width();
        this.ctx.canvas.height = this.playground.$playground.height();
        this.playground.$playground.append(this.$canvas);
    }
    start(){
        window.addEventListener("resize", () => {
            this.ctx.canvas.width = this.playground.$playground.width();
            this.ctx.canvas.height = this.playground.$playground.height();
        });
        this.$canvas.on("contextmenu", function() {
            return false;
        });
        this.render();
    }
    update(){
        this.render();
    }
    render(){
        this.ctx.fillStyle="rgba(0,0,0,0.2)";
        this.ctx.fillRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height); 
    }
}