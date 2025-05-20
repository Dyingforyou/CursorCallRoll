class AnimationManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.animationFrame = null;
        this.startTime = null;
        this.duration = 8000; // 增加到8秒
        this.theme = 'running';
        console.log('AnimationManager initialized with canvas:', canvas.width, canvas.height);
    }

    setTheme(theme) {
        this.theme = theme;
        console.log('Theme set to:', theme);
    }

    start(characters, winners) {
        console.log('Starting animation with', characters.length, 'characters');
        this.startTime = Date.now();
        this.animate(characters, winners);
    }

    stop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
            console.log('Animation stopped');
        }
    }

    animate(characters, winners) {
        const currentTime = Date.now();
        const elapsed = currentTime - this.startTime;
        const progress = Math.min(elapsed / this.duration, 1);

        // 清除画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制背景
        this.drawBackground();

        // 更新和绘制角色
        characters.forEach((char, index) => {
            this.updateCharacterPosition(char, index, progress, winners);
            char.draw(this.ctx, this.theme);
            
            // 绘制学生名字
            this.ctx.fillStyle = '#333';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(char.name, char.position.x, char.position.y - 40);
        });

        // 如果动画未完成，继续动画
        if (progress < 1) {
            this.animationFrame = requestAnimationFrame(() => this.animate(characters, winners));
        } else {
            console.log('Animation completed');
            this.onAnimationComplete(winners);
        }
    }

    updateCharacterPosition(char, index, progress, winners) {
        const isWinner = winners.includes(char);
        const baseSpeed = 1.2; // 降低基础速度
        const winnerSpeed = 1.5; // 降低获胜者速度，使差距不要太大
        
        // 设置角色的速度
        char.speed = isWinner ? winnerSpeed : baseSpeed;

        // 更新位置
        const startX = 50;
        const endX = this.canvas.width - 100;
        const distance = endX - startX;
        
        // 计算垂直位置，使角色更紧凑
        const rowHeight = 30; // 减小行高
        const maxRows = Math.ceil(this.canvas.height / rowHeight);
        const row = index % maxRows;
        const column = Math.floor(index / maxRows);
        
        if (this.theme === 'running') {
            char.position.x = startX + (char.speed * progress * distance) + (column * 20); // 添加水平偏移
            char.position.y = 50 + (row * rowHeight);
        } else if (this.theme === 'swimming') {
            char.position.x = startX + (char.speed * progress * distance) + (column * 20);
            char.position.y = 100 + (row * rowHeight);
        } else if (this.theme === 'cycling') {
            char.position.x = startX + (char.speed * progress * distance) + (column * 20);
            char.position.y = 75 + (row * rowHeight);
        }

        // 确保位置在画布范围内
        char.position.x = Math.max(0, Math.min(char.position.x, this.canvas.width));
        char.position.y = Math.max(0, Math.min(char.position.y, this.canvas.height));
    }

    drawBackground() {
        // 绘制背景
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 根据主题绘制不同的背景元素
        switch(this.theme) {
            case 'running':
                this.drawRunningTrack();
                break;
            case 'swimming':
                this.drawSwimmingPool();
                break;
            case 'cycling':
                this.drawCyclingTrack();
                break;
        }
    }

    drawRunningTrack() {
        // 绘制跑道，增加跑道数量
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1; // 减小线条宽度
        const rowHeight = 30;
        const maxRows = Math.ceil(this.canvas.height / rowHeight);
        
        for (let i = 0; i < maxRows; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, 50 + i * rowHeight);
            this.ctx.lineTo(this.canvas.width, 50 + i * rowHeight);
            this.ctx.stroke();
        }
    }

    drawSwimmingPool() {
        // 绘制游泳池
        this.ctx.fillStyle = '#4ECDC4';
        this.ctx.fillRect(0, 100, this.canvas.width, this.canvas.height - 100);
        
        // 绘制泳道线
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 1;
        const rowHeight = 30;
        const maxRows = Math.ceil((this.canvas.height - 100) / rowHeight);
        
        for (let i = 0; i < maxRows; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, 100 + i * rowHeight);
            this.ctx.lineTo(this.canvas.width, 100 + i * rowHeight);
            this.ctx.stroke();
        }
    }

    drawCyclingTrack() {
        // 绘制自行车道
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        const rowHeight = 30;
        const maxRows = Math.ceil(this.canvas.height / rowHeight);
        
        for (let i = 0; i < maxRows; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, 75 + i * rowHeight);
            this.ctx.lineTo(this.canvas.width, 75 + i * rowHeight);
            this.ctx.stroke();
        }
    }

    onAnimationComplete(winners) {
        console.log('Animation complete, winners:', winners.map(w => w.name));
        // 触发动画完成事件
        const event = new CustomEvent('animationComplete', { detail: { winners } });
        this.canvas.dispatchEvent(event);
    }
} 