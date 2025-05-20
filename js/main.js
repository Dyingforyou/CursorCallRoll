document.addEventListener('DOMContentLoaded', () => {
    // 初始化各个管理器
    const characterManager = new CharacterManager();
    const themeManager = new ThemeManager();
    const canvas = document.getElementById('game-canvas');
    const animationManager = new AnimationManager(canvas);

    // 设置画布大小
    function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        console.log('Canvas size:', canvas.width, canvas.height); // 调试信息
    }

    // 初始调整大小
    resizeCanvas();
    
    // 监听窗口大小变化
    window.addEventListener('resize', resizeCanvas);

    // 获取DOM元素
    const settingsPanel = document.getElementById('settings-panel');
    const gameScene = document.getElementById('game-scene');
    const awardCeremony = document.getElementById('award-ceremony');
    const addStudentBtn = document.getElementById('add-student');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const studentInputs = document.getElementById('student-inputs');
    const selectCount = document.getElementById('select-count');
    const themeSelect = document.getElementById('theme-select');

    // 添加学生输入框
    function addStudentInput() {
        const div = document.createElement('div');
        div.className = 'student-input';
        div.innerHTML = `
            <input type="text" placeholder="输入学生姓名">
            <button class="remove-student">×</button>
        `;
        studentInputs.appendChild(div);

        // 添加删除按钮事件
        div.querySelector('.remove-student').addEventListener('click', () => {
            div.remove();
        });
    }

    // 初始化添加学生按钮
    addStudentBtn.addEventListener('click', addStudentInput);

    // 获取所有学生姓名
    function getStudentNames() {
        const inputs = studentInputs.querySelectorAll('input');
        return Array.from(inputs)
            .map(input => input.value.trim())
            .filter(name => name !== '');
    }

    // 开始点名
    startBtn.addEventListener('click', () => {
        const names = getStudentNames();
        if (names.length === 0) {
            alert('请至少添加一名学生！');
            return;
        }

        const count = parseInt(selectCount.value);
        if (count > names.length) {
            alert('选择的人数不能大于学生总数！');
            return;
        }

        // 创建角色
        characterManager.createCharacters(names);
        
        // 获取获胜者
        const winners = characterManager.getRandomWinners(count);
        
        // 设置主题
        const theme = themeSelect.value;
        themeManager.setTheme(theme);
        animationManager.setTheme(theme);

        // 显示游戏场景
        settingsPanel.classList.add('hidden');
        gameScene.classList.remove('hidden');
        awardCeremony.classList.add('hidden');

        // 确保Canvas尺寸正确
        resizeCanvas();

        // 开始动画
        animationManager.start(characterManager.characters, winners);
    });

    // 动画完成事件
    canvas.addEventListener('animationComplete', (event) => {
        const winners = event.detail.winners;
        
        // 显示颁奖台
        gameScene.classList.add('hidden');
        awardCeremony.classList.remove('hidden');

        // 更新颁奖台显示
        const podiumSteps = document.querySelectorAll('.podium-step');
        winners.forEach((winner, index) => {
            const character = podiumSteps[index].querySelector('.character');
            const rank = podiumSteps[index].querySelector('.rank');
            
            // 设置角色样式
            character.style.backgroundColor = winner.clothesColor;
            character.style.border = `4px solid ${winner.hairColor}`;
            
            // 更新排名显示，包含学生名字
            rank.textContent = `${rank.textContent}：${winner.name}`;
        });
    });

    // 重新开始按钮
    restartBtn.addEventListener('click', () => {
        // 重置所有状态
        characterManager.reset();
        animationManager.stop();
        
        // 显示设置面板
        settingsPanel.classList.remove('hidden');
        gameScene.classList.add('hidden');
        awardCeremony.classList.add('hidden');
    });

    // 初始化添加一个学生输入框
    addStudentInput();
}); 