class AnimationManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.animationFrame = null;
        this.startTime = null;
        this.duration = 14000;
        this.duckImages = [];
        this.backgroundImage = new Image();
        this.backgroundImage.src = 'images/background.png';
        this.loadDuckImages();
        this.isAnimating = false;
        this.characters = [];
        this.winners = [];
        this.finishedCount = 0;
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
            speed: 0.3 + Math.random() * 0.4, // 增加初始速度差异
            position: { x: 50, y: char.position.y }, // 重置到起点
            finished: false, // 添加完成状态标记
            swimOffset: 0, // 添加游泳动画偏移量
            swimDirection: 1, // 添加游泳方向
            speedChangeTimer: 0, // 添加速度变化计时器
            speedChangeInterval: 500 + Math.random() * 1000 // 随机速度变化间隔
        }));
        this.winners = winners;
        this.isAnimating = true;
        this.finishedCount = 0;
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
        this.finishedCount = 0;
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
            if (!char.finished) { // 只更新未完成的角色
                this.updateCharacterPosition(char, index, progress);
            }
            this.drawDuck(char);
            
            // 绘制学生名字（带白色底框）
            const name = char.name;
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            
            // 计算文字宽度
            const textMetrics = this.ctx.measureText(name);
            const textWidth = textMetrics.width;
            const textHeight = 20; // 估计文字高度
            const padding = 5; // 内边距
            
            // 绘制白色底框
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.fillRect(
                char.position.x - textWidth/2 - padding,
                char.position.y - 40 - textHeight - padding,
                textWidth + padding * 2,
                textHeight + padding * 2
            );
            
            // 绘制黑色文字
            this.ctx.fillStyle = '#000000';
            this.ctx.fillText(name, char.position.x, char.position.y - 40);
        });

        // 检查是否所有获胜者都到达终点
        if (this.finishedCount >= this.winners.length) {
            this.isAnimating = false;
            this.onAnimationComplete(this.winners);
            return;
        }

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
        const endX = this.canvas.width - 100;
        
        // 如果已经到达终点，标记为完成
        if (char.position.x >= endX) {
            if (!char.finished) {
                char.finished = true;
                this.finishedCount++;
            }
            return;
        }

        // 更新游泳动画
        char.swimOffset += 0.1 * char.swimDirection;
        if (Math.abs(char.swimOffset) >= 2) {
            char.swimDirection *= -1;
        }

        // 更新速度变化计时器
        char.speedChangeTimer += 16; // 假设每帧16ms
        if (char.speedChangeTimer >= char.speedChangeInterval) {
            char.speedChangeTimer = 0;
            // 随机生成新的速度变化间隔
            char.speedChangeInterval = 500 + Math.random() * 1000;
            
            // 生成新的速度变化
            const speedChange = (Math.random() - 0.5) * 0.3; // 减小速度变化范围
            char.speed = Math.max(0.15, Math.min(0.8, char.speed + speedChange));
        }

        // 获胜者额外速度加成
        if (isWinner) {
            const boost = 0.15 + Math.random() * 0.15; // 减小速度加成
            char.speed = Math.min(0.9, char.speed + boost);
        }

        const startX = 50;
        const distance = endX - startX;
        
        const rowHeight = 60;
        const maxRows = Math.ceil((this.canvas.height - 100) / rowHeight);
        const row = index % maxRows;
        
        char.position.x = Math.min(endX, char.position.x + char.speed);
        char.position.y = 100 + (row * rowHeight) + char.swimOffset;
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
        // 绘制背景图
        if (this.backgroundImage.complete) {
            this.ctx.drawImage(this.backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
        }

        // 绘制起点和终点线（白色虚线）
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 10]); // 设置虚线样式

        // 起点线
        this.ctx.beginPath();
        this.ctx.moveTo(50, 0);
        this.ctx.lineTo(50, this.canvas.height);
        this.ctx.stroke();

        // 终点线
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width - 100, 0);
        this.ctx.lineTo(this.canvas.width - 100, this.canvas.height);
        this.ctx.stroke();

        // 重置虚线样式
        this.ctx.setLineDash([]);
    }

    onAnimationComplete(winners) {
        // 创建获奖名单显示
        const container = document.createElement('div');
        container.className = 'winners-list';
        container.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 255, 255, 0.95);
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            min-width: 300px;
        `;

        const title = document.createElement('h2');
        title.textContent = '🏆 获奖名单 🏆';
        title.style.cssText = `
            text-align: center;
            color: #333;
            margin-bottom: 20px;
            font-size: 24px;
        `;
        container.appendChild(title);

        const list = document.createElement('ul');
        list.style.cssText = `
            list-style: none;
            padding: 0;
            margin: 0;
        `;

        winners.forEach((winner, index) => {
            const item = document.createElement('li');
            item.style.cssText = `
                padding: 10px 20px;
                margin: 5px 0;
                background: ${index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'};
                color: white;
                border-radius: 5px;
                display: flex;
                align-items: center;
                font-size: 18px;
                animation: slideIn 0.5s ease-out ${index * 0.2}s both;
            `;

            const rank = document.createElement('span');
            rank.textContent = `${index + 1}. `;
            rank.style.marginRight = '10px';

            const name = document.createElement('span');
            name.textContent = winner.name;

            item.appendChild(rank);
            item.appendChild(name);
            list.appendChild(item);
        });

        container.appendChild(list);

        // 添加关闭按钮
        const closeButton = document.createElement('button');
        closeButton.textContent = '关闭';
        closeButton.style.cssText = `
            display: block;
            margin: 20px auto 0;
            padding: 8px 20px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        `;
        closeButton.onclick = () => container.remove();
        container.appendChild(closeButton);

        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateX(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(container);
    }
} 