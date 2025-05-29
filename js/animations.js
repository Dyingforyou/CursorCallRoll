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
        this.count = 0;

        // 设置画布为全屏
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    loadDuckImages() {
        // 加载所有鸭子图片
        for (let i = 1; i <= 8; i++) {
            const img = new Image();
            img.src = `images/Rubber-Duck (${i}).png`;
            this.duckImages.push(img);
        }
    }

    start(characters,count) {
        this.stop();
        
        // 计算合适的行数和列数
        const totalDucks = characters.length;

        // const aspectRatio = this.canvas.width / this.canvas.height;
        // const cols = Math.ceil(Math.sqrt(totalDucks * aspectRatio));
        // const rows = Math.ceil(totalDucks / cols);
        const canvasHeight = this.canvas.height;
    
        // 计算合适的垂直间距
        const minSpacing = 10; // 鸭子间最小间距
        const topBottomMargin = 50; // 顶部和底部边距
        
        // 可用的垂直空间
        const availableHeight = canvasHeight - 2 * topBottomMargin;
        
        // 计算每个鸭子的垂直位置
        const positions = [];
        if (totalDucks > 1) {
            // 多个鸭子：均匀分布
            const spacing = Math.max(minSpacing, availableHeight / (totalDucks - 1));
            for (let i = 0; i < totalDucks; i++) {
                positions.push(topBottomMargin + i * spacing);
            }
        } else if (totalDucks === 1) {
            // 只有一个鸭子：居中显示
            positions.push(canvasHeight / 2);
        }
        
        // 计算每个鸭子的位置
        // const cellWidth = this.canvas.width / cols;
        // const cellHeight = this.canvas.height / rows;
        
        this.characters = characters.map((char, index) => {
            // const col = index % cols;
            // const row = Math.floor(index / cols);

        console.log('positions'+positions[index])
            return {
                ...char,
                speed: 0.15 + Math.random() * 0.3,
                position: { 
                    x: 50, 
                    y: positions[index]
                },
                initialY: positions[index],
                finished: false,
                swimOffset: 0,
                swimDirection: 1,
                speedChangeTimer: 0,
                speedChangeInterval: 500 + Math.random() * 1000
            };
        });
        this.count = count;
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
        if (this.finishedCount >= this.count) {
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
        //const isWinner = this.winners.includes(char);
        const endX = this.canvas.width - 100;
        
        if (char.position.x >= endX) {
            if (!char.finished) {
                char.finished = true;
                this.finishedCount++;
                this.winners.push(char)
            }
            return;
        }

        // 更新游泳动画
        char.swimOffset += 0.1 * char.swimDirection;
        if (Math.abs(char.swimOffset) >= 2) {
            char.swimDirection *= -1;
        }

        // 更新速度变化计时器
        char.speedChangeTimer += 16;
        if (char.speedChangeTimer >= char.speedChangeInterval) {
            char.speedChangeTimer = 0;
            char.speedChangeInterval = 500 + Math.random() * 1000;
            
            const speedChange = (Math.random() - 0.5) * 0.3;
            char.speed = Math.max(0.15, Math.min(0.8, char.speed + speedChange));
        }

        // if (isWinner) {
        //     const boost = 0.15 + Math.random() * 0.15;
        //     char.speed = Math.min(0.9, char.speed + boost);
        // }

        const startX = 50;
        const distance = endX - startX;
        
        // 使用原始行高计算，保持垂直位置不变
        const rowHeight = this.canvas.height / Math.ceil(this.characters.length / Math.ceil(Math.sqrt(this.characters.length * (this.canvas.width / this.canvas.height))));
        const row = Math.floor(index / Math.ceil(Math.sqrt(this.characters.length * (this.canvas.width / this.canvas.height))));
        
        char.position.x = Math.min(endX, char.position.x + char.speed);
        // char.position.y = (row * rowHeight) + (rowHeight / 2) + char.swimOffset;
        char.position.y = char.initialY + char.swimOffset;
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
        this.ctx.setLineDash([10, 10]);

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