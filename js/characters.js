class Character {
    constructor(name) {
        this.name = name;
        this.duckIndex = Math.floor(Math.random() * 8); // 随机选择一个鸭子图片
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