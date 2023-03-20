export class AcGame {
    constructor(id){
        // console.log('create ac game')
        this.id=id;
        this.$ac_game=$('#'+this.id);
        this.settings=new Settings(this);
        this.menu=new AcGameMenu(this);
        this.playground=new AcGamePlayground(this);
    }
}