class AnimationManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.animationFrame = null;
        this.startTime = null;
        this.duration = 8000; // 8秒
        this.duckImages = [];
        this.loadDuckImages();
        this.isAnimating = false;
        this.characters = [];
        this.winners = [];
    }

    loadDuckImages() {
        // 加载所有鸭子图片
        for (let i = 1; i <= 8; i++) {
            const img = new Image();
            img.src = `images/Rubber-Duck (${i}).png`;
            this.duckImages.push(img);
        }
    }

    start(characters, winners) {
        // 确保在开始新动画前清理旧动画
        this.stop();
        
        // 重置所有状态
        this.characters = characters.map(char => ({
            ...char,
            speed: 0.8 + Math.random() * 0.4, // 初始化基础速度
            position: { x: 50, y: char.position.y } // 重置到起点
        }));
        this.winners = winners;
        this.isAnimating = true;
        this.startTime = Date.now();
        this.animate();
    }

    stop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        this.isAnimating = false;
        this.characters = [];
        this.winners = [];
        // 清除画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    animate() {
        if (!this.isAnimating) return;

        const currentTime = Date.now();
        const elapsed = currentTime - this.startTime;
        const progress = Math.min(elapsed / this.duration, 1);

        // 清除画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制背景
        this.drawBackground();

        // 更新和绘制角色
        this.characters.forEach((char, index) => {
            this.updateCharacterPosition(char, index, progress);
            this.drawDuck(char);
            
            // 绘制学生名字
            this.ctx.fillStyle = '#333';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(char.name, char.position.x, char.position.y - 40);
        });

        // 如果动画未完成，继续动画
        if (progress < 1) {
            this.animationFrame = requestAnimationFrame(() => this.animate());
        } else {
            this.isAnimating = false;
            this.onAnimationComplete(this.winners);
        }
    }

    updateCharacterPosition(char, index, progress) {
        const isWinner = this.winners.includes(char);
        
        // 随机速度波动，但确保不会后退
        if (Math.random() < 0.1) { // 10%的概率改变速度
            const speedChange = (Math.random() - 0.5) * 0.2; // 速度变化范围：-0.1 到 0.1
            char.speed = Math.max(0.8, Math.min(1.5, char.speed + speedChange)); // 确保速度在0.8-1.5之间
        }

        // 获胜者额外速度加成
        if (isWinner && char.speed < 1.5) {
            char.speed = Math.min(1.5, char.speed + 0.3);
        }

        // 更新位置
        const startX = 50;
        const endX = this.canvas.width - 100;
        const distance = endX - startX;
        
        // 计算垂直位置
        const rowHeight = 60;
        const maxRows = Math.ceil((this.canvas.height - 100) / rowHeight);
        const row = index % maxRows;
        
        // 确保鸭子只向前移动
        char.position.x = startX + (char.speed * progress * distance);
        char.position.y = 100 + (row * rowHeight);

        // 确保位置在画布范围内
        char.position.x = Math.max(startX, Math.min(char.position.x, endX));
        char.position.y = Math.max(100, Math.min(char.position.y, this.canvas.height));
    }

    drawDuck(char) {
        const duckImage = this.duckImages[char.duckIndex];
        if (duckImage && duckImage.complete) {
            const size = 50; // 鸭子大小
            this.ctx.drawImage(
                duckImage,
                char.position.x - size/2,
                char.position.y - size/2,
                size,
                size
            );
        }
    }

    drawBackground() {
        // 绘制天空
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, 100);

        // 绘制游泳池
        this.ctx.fillStyle = '#4ECDC4';
        this.ctx.fillRect(0, 100, this.canvas.width, this.canvas.height - 100);
        
        // 绘制泳道线
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        const rowHeight = 60;
        const maxRows = Math.ceil((this.canvas.height - 100) / rowHeight);
        
        for (let i = 0; i < maxRows; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, 100 + i * rowHeight);
            this.ctx.lineTo(this.canvas.width, 100 + i * rowHeight);
            this.ctx.stroke();
        }

        // 绘制起点线
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(50, 100);
        this.ctx.lineTo(50, this.canvas.height);
        this.ctx.stroke();

        // 绘制终点线
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width - 100, 100);
        this.ctx.lineTo(this.canvas.width - 100, this.canvas.height);
        this.ctx.stroke();
    }

    onAnimationComplete(winners) {
        // 触发动画完成事件
        const event = new CustomEvent('animationComplete', { detail: { winners } });
        this.canvas.dispatchEvent(event);
    }
} 