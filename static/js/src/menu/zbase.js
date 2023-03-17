class AcGameMenu{
    constructor(root){
        this.root=root;
        this.$menu=$(`
            <div class="ac-game-menu">
                <div class="ac-game-menu-field">
                    <div class="ac-game-menu-field-item ac-game-menu-field-item-single_mode">单人模式</div>
                    <div class="ac-game-menu-field-item ac-game-menu-field-item-multi_mode">多人模式</div>
                    <div class="ac-game-menu-field-item ac-game-menu-field-item-settings">设置</div>
                </div>
            </div>
        `);
        this.root.$ac_game.append(this.$menu);
        this.$single_mode = this.$menu.find('.ac-game-menu-field-item-single_mode');
        this.$multi_mode = this.$menu.find('.ac-game-menu-field-item-multi_mode');
        this.$settings = this.$menu.find('.ac-game-menu-field-item-settings');
        
        this.start();
    }
    start(){
        this.add_listening_events();
    }
    add_listening_events() {
        let outer = this;
        this.$single_mode.click(function(){
            outer.hide(); // 隐藏menu div
            outer.root.playground.show(); // 显示playground div
        });
        this.$multi_mode.click(function(){
            console.log("click multi_mode");
        });
        this.$settings.click(function(){
            console.log("click settings");
        });
    }
    show(){ // 显示menu界面
        this.$menu.show();
    }
    hide(){ // 隐藏menu界面
        this.$menu.hide();
    }
}