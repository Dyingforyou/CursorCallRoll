document.addEventListener('DOMContentLoaded', () => {
    // 初始化各个管理器
    const characterManager = new CharacterManager();
    const canvas = document.getElementById('game-canvas');
    const animationManager = new AnimationManager(canvas);

    // 设置画布大小
    function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
    }

    // 初始调整大小
    resizeCanvas();
    
    // 监听窗口大小变化
    window.addEventListener('resize', resizeCanvas);

    // 获取DOM元素
    const settingsPanel = document.getElementById('settings-panel');
    const gameScene = document.getElementById('game-scene');
    const awardCeremony = document.getElementById('award-ceremony');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const selectCount = document.getElementById('select-count');
    const addClassBtn = document.getElementById('add-class');
    const classNameInput = document.getElementById('class-name');
    const classSelect = document.getElementById('class-select');
    const studentNames = document.getElementById('student-names');

    // 班级数据存储
    const classes = new Map();

    // 从localStorage加载数据
    function loadFromLocalStorage() {
        const savedClasses = localStorage.getItem('classes');
        if (savedClasses) {
            const parsedClasses = JSON.parse(savedClasses);
            parsedClasses.forEach(([className, students]) => {
                classes.set(className, students);
            });
            updateClassSelect();
        }
    }

    // 保存数据到localStorage
    function saveToLocalStorage() {
        const classArray = Array.from(classes.entries());
        localStorage.setItem('classes', JSON.stringify(classArray));
    }

    // 添加班级
    addClassBtn.addEventListener('click', () => {
        const className = classNameInput.value.trim();
        if (!className) {
            alert('请输入班级名称！');
            return;
        }
        if (classes.has(className)) {
            alert('该班级已存在！');
            return;
        }
        classes.set(className, []);
        updateClassSelect();
        classNameInput.value = '';
        saveToLocalStorage();
    });

    // 更新班级选择下拉框
    function updateClassSelect() {
        classSelect.innerHTML = '<option value="">请选择班级</option>';
        classes.forEach((students, className) => {
            const option = document.createElement('option');
            option.value = className;
            option.textContent = className;
            classSelect.appendChild(option);
        });
    }

    // 班级选择变化时更新学生列表
    classSelect.addEventListener('change', () => {
        const selectedClass = classSelect.value;
        if (selectedClass) {
            const students = classes.get(selectedClass);
            studentNames.value = students.join('\n');
            // 更新选择人数的最大值
            selectCount.max = students.length;
            selectCount.value = Math.min(parseInt(selectCount.value), students.length);
        } else {
            studentNames.value = '';
            selectCount.max = 1;
            selectCount.value = 1;
        }
    });

    // 保存当前班级的学生
    function saveCurrentClassStudents() {
        const selectedClass = classSelect.value;
        if (selectedClass) {
            const students = studentNames.value
                .split('\n')
                .map(name => name.trim())
                .filter(name => name !== '');
            classes.set(selectedClass, students);
            // 更新选择人数的最大值
            selectCount.max = students.length;
            selectCount.value = Math.min(parseInt(selectCount.value), students.length);
            saveToLocalStorage();
        }
    }

    // 监听学生名单变化
    studentNames.addEventListener('change', saveCurrentClassStudents);
    studentNames.addEventListener('blur', saveCurrentClassStudents);

    // 获取所有学生姓名
    function getStudentNames() {
        return studentNames.value
            .split('\n')
            .map(name => name.trim())
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
        //const winners = characterManager.getRandomWinners(count);

        // 显示游戏场景
        settingsPanel.classList.add('hidden');
        gameScene.classList.remove('hidden');
        awardCeremony.classList.add('hidden');

        // 确保Canvas尺寸正确
        resizeCanvas();

        // 开始动画
        animationManager.start(characterManager.characters, count);
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
            character.style.backgroundImage = `url('images/Rubber-Duck (${winner.duckIndex + 1}).png')`;
            character.style.backgroundSize = 'contain';
            character.style.backgroundRepeat = 'no-repeat';
            character.style.backgroundPosition = 'center';
            
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

    // 加载保存的数据
    loadFromLocalStorage();
}); 