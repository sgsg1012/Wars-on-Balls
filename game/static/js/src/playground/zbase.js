class AcGamePlayground{
    constructor(root){
        this.root=root;
        this.$playground=$(`
            <div class="ac-game-playground">

            </div>
        `);
        this.root.$ac_game.append(this.$playground);
        




        this.start();
    }
    start(){
        // this.hide();
    }
    show(){
        this.$playground.show();
    }
    hide(){
        this.$playground.hide();
    }
}