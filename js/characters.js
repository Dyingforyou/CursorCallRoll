class Character {
    constructor(name) {
        this.name = name;
        this.hairColor = this.generateRandomColor();
        this.clothesColor = this.generateRandomColor();
        this.position = { x: 0, y: 0 };
        this.speed = 0;
        this.isWinner = false;
    }

    generateRandomColor() {
        const colors = [
            '#FF6B6B', // 红色
            '#4ECDC4', // 青色
            '#45B7D1', // 蓝色
            '#96CEB4', // 绿色
            '#FFEEAD', // 黄色
            '#D4A5A5', // 粉色
            '#9B59B6', // 紫色
            '#3498DB', // 深蓝色
            '#E67E22', // 橙色
            '#2ECC71'  // 浅绿色
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    draw(ctx, theme) {
        // 绘制角色身体
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 20, 0, Math.PI * 2);
        ctx.fillStyle = this.clothesColor;
        ctx.fill();

        // 绘制头发
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y - 10, 15, 0, Math.PI * 2);
        ctx.fillStyle = this.hairColor;
        ctx.fill();

        // 绘制眼睛
        ctx.beginPath();
        ctx.arc(this.position.x - 5, this.position.y - 5, 3, 0, Math.PI * 2);
        ctx.arc(this.position.x + 5, this.position.y - 5, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();

        // 绘制嘴巴
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y + 5, 5, 0, Math.PI);
        ctx.strokeStyle = '#000';
        ctx.stroke();

        // 根据主题绘制不同的运动装备
        this.drawThemeEquipment(ctx, theme);
    }

    drawThemeEquipment(ctx, theme) {
        switch(theme) {
            case 'running':
                // 绘制跑步鞋
                ctx.beginPath();
                ctx.rect(this.position.x - 15, this.position.y + 15, 10, 5);
                ctx.rect(this.position.x + 5, this.position.y + 15, 10, 5);
                ctx.fillStyle = '#333';
                ctx.fill();
                break;
            case 'swimming':
                // 绘制泳镜
                ctx.beginPath();
                ctx.rect(this.position.x - 10, this.position.y - 8, 20, 5);
                ctx.fillStyle = '#4ECDC4';
                ctx.fill();
                break;
            case 'cycling':
                // 绘制自行车头盔
                ctx.beginPath();
                ctx.arc(this.position.x, this.position.y - 15, 12, 0, Math.PI);
                ctx.fillStyle = '#FFD700';
                ctx.fill();
                break;
        }
    }
}

// 角色管理器
class CharacterManager {
    constructor() {
        this.characters = [];
    }

    createCharacters(names) {
        this.characters = names.map(name => new Character(name));
    }

    getRandomWinners(count) {
        const shuffled = [...this.characters].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    reset() {
        this.characters.forEach(char => {
            char.position = { x: 0, y: 0 };
            char.speed = 0;
            char.isWinner = false;
        });
    }
} 