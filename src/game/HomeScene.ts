import Phaser from 'phaser';
import { SaveService, getSelectedSkin } from '../core/saveService';
import { button, card, title, UI } from '../ui/uiStyle';
export class HomeScene extends Phaser.Scene {
  constructor() { super('HomeScene'); }
  create(): void {
    const { width, height } = this.scale; const save = SaveService.load(); const skin = getSelectedSkin();
    SaveService.ensureMissions(new Date().toISOString().slice(0, 10)); this.cameras.main.setBackgroundColor(UI.bg);
    for (let i=0;i<5;i++) this.add.rectangle(width/2,height*(0.12+i*0.18),width,height*0.18,[0x102945,0x0f2840,0x112f43,0x123c47,0x17464b][i],0.22);
    title(this,'DASH DODGE',height*0.075);
    this.add.text(width/2,height*0.125,'3-LANE ENDLESS RUN',{fontFamily:'Arial',fontSize:'13px',color:UI.muted,letterSpacing:2}).setOrigin(.5);
    const hero=card(this,width/2,height*.245,112,118,true).setFillStyle(skin.color); hero.setStrokeStyle(3,0xffffff,.85);
    this.add.circle(width/2,height*.225,22,0xffffff,.22); this.add.rectangle(width/2,height*.27,34,42,0xffffff,.2).setStrokeStyle(2,0xffffff,.4);
    this.tweens.add({targets:hero,y:hero.y-4,duration:900,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
    this.add.text(width/2,height*.335,skin.name.toUpperCase(),{fontFamily:'Arial',fontSize:'11px',color:'#ffffff',fontStyle:'bold',letterSpacing:1}).setOrigin(.5);
    this.add.text(width/2,height*.385,'BEST  '+save.bestScore+'     •     COINS  '+save.coins,{fontFamily:'Arial',fontSize:'14px',color:UI.gold,fontStyle:'bold'}).setOrigin(.5);
    button(this,width/2,height*.455,238,58,'▶  PLAY',UI.accent,'#07111f',()=>this.scene.start(save.tutorialSeen?'PlayScene':'TutorialScene'));
    button(this,width/2,height*.535,238,45,'🎁  DAILY REWARD',0x48cfa8,'#07111f',()=>this.scene.start('DailyScene'));
    button(this,width/2,height*.60,238,45,'◆  MISSIONS',0x7bdff2,'#07111f',()=>this.scene.start('MissionScene'));
    button(this,width/2,height*.665,238,45,'🏆  LEADERBOARD',UI.panel2,'#ffffff',()=>this.scene.start('LeaderboardScene'));
    button(this,width/2,height*.73,238,45,'◈  SHOP',UI.gold,'#07111f',()=>this.scene.start('ShopScene'));
    button(this,width/2,height*.795,238,45,'⚙  SETTINGS',UI.panel2,'#ffffff',()=>this.scene.start('SettingsScene'));
    this.add.text(width/2,height*.9,'SWIPE  •  TAP  •  ARROWS',{fontFamily:'Arial',fontSize:'11px',color:UI.muted,fontStyle:'bold',letterSpacing:1}).setOrigin(.5);
  }
}