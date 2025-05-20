class ThemeManager {
    constructor() {
        this.currentTheme = 'running';
        this.themes = {
            running: {
                name: '跑步比赛',
                description: '在跑道上进行激烈的跑步比赛',
                background: '#f0f0f0',
                trackColor: '#333',
                characterOffset: 60
            },
            swimming: {
                name: '游泳比赛',
                description: '在游泳池中进行游泳比赛',
                background: '#4ECDC4',
                trackColor: '#fff',
                characterOffset: 40
            },
            cycling: {
                name: '自行车比赛',
                description: '在自行车道上进行比赛',
                background: '#f0f0f0',
                trackColor: '#333',
                characterOffset: 50
            }
        };
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    setTheme(theme) {
        if (this.themes[theme]) {
            this.currentTheme = theme;
            return true;
        }
        return false;
    }

    getThemeInfo(theme) {
        return this.themes[theme] || null;
    }

    getAllThemes() {
        return Object.keys(this.themes);
    }

    getThemeNames() {
        return Object.entries(this.themes).map(([key, value]) => ({
            value: key,
            name: value.name
        }));
    }
} 