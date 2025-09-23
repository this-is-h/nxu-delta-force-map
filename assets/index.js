document.addEventListener('DOMContentLoaded', function() {
    // 预加载功能 - 创建全屏遮罩层
    function createPreloader() {
        const preloader = document.createElement('div');
        preloader.id = 'preloader';
        preloader.style.position = 'fixed';
        preloader.style.top = '0';
        preloader.style.left = '0';
        preloader.style.width = '100%';
        preloader.style.height = '100%';
        preloader.style.backgroundColor = '#000';
        preloader.style.display = 'flex';
        preloader.style.flexDirection = 'column';
        preloader.style.justifyContent = 'center';
        preloader.style.alignItems = 'center';
        preloader.style.zIndex = '9999';
        preloader.style.color = '#fff';
        preloader.style.fontSize = '18px';
        preloader.style.fontFamily = 'Microsoft YaHei, sans-serif';
        preloader.style.transition = 'opacity 0.5s ease-out';
        
        const loadingText = document.createElement('div');
        loadingText.textContent = '正在加载资源，请耐心等待...';
        loadingText.style.marginBottom = '20px';
        
        const progressBarContainer = document.createElement('div');
        progressBarContainer.style.width = '300px';
        progressBarContainer.style.height = '20px';
        progressBarContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        progressBarContainer.style.borderRadius = '10px';
        progressBarContainer.style.overflow = 'hidden';
        
        const progressBar = document.createElement('div');
        progressBar.id = 'preloader-progress';
        progressBar.style.width = '0%';
        progressBar.style.height = '100%';
        progressBar.style.backgroundColor = 'rgb(15, 247, 150)';
        progressBar.style.transition = 'width 0.3s ease';
        
        const progressText = document.createElement('div');
        progressText.id = 'preloader-progress-text';
        progressText.textContent = '0%';
        progressText.style.marginTop = '10px';
        progressText.style.fontSize = '14px';
        
        progressBarContainer.appendChild(progressBar);
        preloader.appendChild(loadingText);
        preloader.appendChild(progressBarContainer);
        preloader.appendChild(progressText);
        
        document.body.appendChild(preloader);
    }
    
    // 移除预加载遮罩
    function removePreloader() {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(preloader);
            }, 500);
        }
    }
    
    // 更新预加载进度
    function updatePreloaderProgress(progress) {
        const progressBar = document.getElementById('preloader-progress');
        const progressText = document.getElementById('preloader-progress-text');
        if (progressBar && progressText) {
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `${Math.round(progress)}%`;
        }
    }
    
    // 获取需要预加载的图片列表
    function getImageList() {
        const images = [];
        
        // 添加地图图片
        images.push('assets/img/map/wencui.png');
        images.push('assets/img/map/helanshan.png');
        images.push('assets/img/map/huaiyuan.png');
        
        // 添加图标图片（排除.gitignore中指定的目录）
        images.push('assets/img/icon/boss.png');
        images.push('assets/img/icon/evacuate.png');
        images.push('assets/img/icon/evacuate_conditional.png');
        images.push('assets/img/icon/evacuate_pay.png');
        images.push('assets/img/icon/high_value_task.png');
        images.push('assets/img/icon/safe_box.png');
        images.push('assets/img/icon/small_safe_box.png');
        images.push('assets/img/icon/switch.png');
        images.push('assets/img/icon/task.png');
        
        // 添加奖励图片（排除.gitignore中指定的目录）
        images.push('assets/img/rewards/bust-of-claudius.png');
        images.push('assets/img/rewards/experimental-data.png');
        images.push('assets/img/rewards/golden-gazelle.png');
        images.push('assets/img/rewards/heart-of-africa.png');
        images.push('assets/img/rewards/mandel-supercomputing-unit.png');
        images.push('assets/img/rewards/precious-mechanical-watch.png');
        images.push('assets/img/rewards/quantum-storage.png');
        
        return images;
    }
    
    // 预加载图片
    function preloadImages(images) {
        return new Promise((resolve) => {
            if (images.length === 0) {
                resolve();
                return;
            }
            
            let loadedCount = 0;
            
            images.forEach(imgSrc => {
                const img = new Image();
                img.onload = () => {
                    loadedCount++;
                    const progress = (loadedCount / images.length) * 100;
                    updatePreloaderProgress(progress);
                    
                    if (loadedCount === images.length) {
                        resolve();
                    }
                };
                img.onerror = () => {
                    console.warn(`Failed to load image: ${imgSrc}`);
                    loadedCount++;
                    const progress = (loadedCount / images.length) * 100;
                    updatePreloaderProgress(progress);
                    
                    if (loadedCount === images.length) {
                        resolve();
                    }
                };
                img.src = imgSrc;
            });
        });
    }
    
    // 开始预加载流程
    async function startPreloading() {
        createPreloader();
        const images = getImageList();
        await preloadImages(images);
        removePreloader();
        initializeMap();
    }
    
    // 获取DOM元素
    const mapContainer = document.getElementById('map-container');
    const map = document.getElementById('map');
    const mapImg = document.getElementById('map-img');
    const zoomIn = document.getElementById('zoom-in');
    const zoomOut = document.getElementById('zoom-out');
    const popup = document.getElementById('info-popup');
    const popupTitle = document.getElementById('popup-title');
    const popupContent = document.getElementById('popup-content');
    const popupClose = document.getElementById('popup-close');

    // 地图状态
    let mapState = {
        scale: 1,
        minScale: 1,  // 最小缩放比例
        maxScale: 10,  // 最大缩放比例
        translateX: 0,
        translateY: 0,
        lastPosX: 0,
        lastPosY: 0,
        isDragging: false,
        backgroundColor: '#000' // 默认背景色
    };

    // 图标数据 - 示例数据，可以根据需要修改
    const wencuiIconData = [
        { x: 0.73, y: 0.443, icon: 'assets/img/icon/boss.png', class: 'icon-boss', title: '团委书记', content: '' },
        { x: 0.72, y: 0.48, icon: 'assets/img/icon/safe_box.png', class: 'icon-safe-box', title: '保险箱', content: '高价值容器<div class="divider"></div>高概率出现<div class="rewards"><img class="back-red" src="assets/img/rewards/heart-of-africa.png"></img><img class="back-red" src="assets/img/rewards/bust-of-claudius.png"></img><img class="back-red" src="assets/img/rewards/golden-gazelle.png"></img><img class="back-red" src="assets/img/rewards/precious-mechanical-watch.png"></img></div>' },
        { x: 0.7335, y: 0.4095, icon: 'assets/img/icon/small_safe_box.png', class: 'icon-safe-box', title: '骇客电脑', content: '高价值容器<div class="divider"></div>高概率出现<div class="rewards"><img class="back-red" src="assets/img/rewards/mandel-supercomputing-unit.png"></img><img class="back-red" src="assets/img/rewards/experimental-data.png"></img><img class="back-red" src="assets/img/rewards/quantum-storage.png"></img></div>' },
        { x: 0.35, y: 0.3415, icon: 'assets/img/icon/boss.png', class: 'icon-boss', title: '书院领导', content: '' },
        { x: 0.3425, y: 0.29, icon: 'assets/img/icon/safe_box.png', class: 'icon-safe-box', title: '保险箱', content: '高价值容器<div class="divider"></div>高概率出现<div class="rewards"><img class="back-red" src="assets/img/rewards/heart-of-africa.png"></img><img class="back-red" src="assets/img/rewards/gold-bar.png"></img><img class="back-red" src="assets/img/rewards/golden-gazelle.png"></img><img class="back-red" src="assets/img/rewards/precious-mechanical-watch.png"></img></div>' },
        { x: 0.495, y: 0.782, icon: 'assets/img/icon//evacuate_conditional.png', class: 'icon-evacuate', title: '南门撤离点', content: '撤离名额还有<span style="color: rgb(255, 236, 140);">1</span>名<div class="divider"></div>身份牌撤离点' },
        { x: 0.72, y: 0.402, icon: 'assets/img/icon/switch.png', class: 'icon-switch icon-connect', title: '拉闸', content: '启动两个开关以开启<span style="color: rgb(255, 236, 140);">拉闸撤离点：东门</span>' },
        { x: 0.754, y: 0.7, icon: 'assets/img/icon/switch.png', class: 'icon-switch icon-connect', title: '拉闸', content: '启动两个开关以开启<span style="color: rgb(255, 236, 140);">拉闸撤离点：东门</span>' },
        { x: 0.783, y: 0.56, icon: 'assets/img/icon/evacuate_conditional.png', class: 'icon-evacuate icon-connect', title: '拉闸撤离点：东门', content: '需<span style="color: rgb(255, 236, 140);">拉闸</span>开启撤离点<div class="divider"></div>启动两个开关以开启此撤离点' },
        { x: 0.251, y: 0.489, icon: 'assets/img/icon/evacuate_conditional.png', class: 'icon-evacuate', title: '条件撤离点：菜鸟驿站', content: '条件撤离点，从此处撤离需要丢弃<span style="color: rgb(255, 236, 140);">背包</span><div class="divider"></div>乘坐快递小车撤离吧' },
        { x: 0.53, y: 0.426, icon: 'assets/img/icon/small_safe_box.png', class: 'icon-safe-box', title: '保险箱', content: '次高价值容器<div class="divider"></div>高概率出现<div class="rewards"></div>' },
        { x: 0.593, y: 0.69, icon: 'assets/img/icon/small_safe_box.png', class: 'icon-safe-box', title: '保险箱', content: '次高价值容器<div class="divider"></div>高概率出现<div class="rewards"></div>' },
        { x: 0.285, y: 0.455, icon: 'assets/img/icon/small_safe_box.png', class: 'icon-safe-box', title: '骇客电脑', content: '高价值容器<div class="divider"></div>高概率出现<div class="rewards"></div>' },
        { x: 0.515, y: 0.315, icon: 'assets/img/icon/small_safe_box.png', class: 'icon-safe-box', title: '骇客电脑', content: '高价值容器<div class="divider"></div>高概率出现<div class="rewards"></div>' },
        { x: 0.76, y: 0.68, icon: 'assets/img/icon/small_safe_box.png', class: 'icon-safe-box', title: '骇客电脑', content: '高价值容器<div class="divider"></div>高概率出现<div class="rewards"></div>' },
        { x: 0.65, y: 0.31, icon: 'assets/img/icon/high_value_task.png', class: 'icon-task', title: '【高价值】', content: '任务内容<div class="divider"></div>地点：<div class="divider"></div>报酬：<div class="divider"></div>行动内概率产出<div class="rewards"></div>' },
        { x: 0.71, y: 0.7, icon: 'assets/img/icon/task.png', class: 'icon-task', title: '任务', content: '任务内容<div class="divider"></div>地点：<div class="divider"></div>报酬：<div class="divider"></div>行动内概率产出<div class="rewards"></div>' },
        { x: 0.555, y: 0.54, icon: 'assets/img/icon/task.png', class: 'icon-task', title: '任务', content: '任务内容<div class="divider"></div>地点：<div class="divider"></div>报酬：<div class="divider"></div>行动内概率产出<div class="rewards"></div>' },
        { x: 0.46, y: 0.645, icon: 'assets/img/icon/task.png', class: 'icon-task', title: '任务', content: '任务内容<div class="divider"></div>地点：<div class="divider"></div>报酬：<div class="divider"></div>行动内概率产出<div class="rewards"></div>' },
        { x: 0.26, y: 0.22, icon: 'assets/img/icon/task.png', class: 'icon-task', title: '任务', content: '任务内容<div class="divider"></div>地点：<div class="divider"></div>报酬：<div class="divider"></div>行动内概率产出<div class="rewards"></div>' },
    ];

    const wencuiLocationData = [
        { x: 0.725, y: 0.455, title: '大学生活动中心'},
        { x: 0.353, y: 0.359, title: '小广场'},
        { x: 0.375, y: 0.465, title: '宿舍区'},
        { x: 0.485, y: 0.28, title: '宿舍区'},
        { x: 0.24, y: 0.4, title: '宿舍区'},
        { x: 0.492, y: 0.4235, title: '食堂'},
        { x: 0.573, y: 0.63, title: '教学区'},
        { x: 0.73, y: 0.68, title: '图书馆'},
        { x: 0.615, y: 0.342, title: '运动场'}
    ];
    
    // 示例：第二个地图的数据
    const helanshanIconData = [
        { x: 0.365, y: 0.62, icon: 'assets/img/icon/boss.png', class: 'icon-boss icon-mosaic', title: '校长', content: '' },
        { x: 0.372, y: 0.6, icon: 'assets/img/icon/safe_box.png', class: 'icon-safe-box', title: '保险箱', content: '高价值容器<div class="divider"></div>高概率出现<div class="rewards"><img class="back-red" src="assets/img/rewards/heart-of-africa.png"></img><img class="back-red" src="assets/img/rewards/bust-of-claudius.png"></img><img class="back-red" src="assets/img/rewards/golden-gazelle.png"></img><img class="back-red" src="assets/img/rewards/precious-mechanical-watch.png"></img></div>' },
        { x: 0.8, y: 0.3, icon: 'assets/img/icon/evacuate_conditional.png', class: 'icon-evacuate', title: '撤离点', content: '另一个地图的撤离点。' }
    ];
    
    const helanshanLocationData = [
        { x: 0.372, y: 0.59, title: '主楼'},
        { x: 0.312, y: 0.636, title: '兰山一教'},
        { x: 0.2, y: 0.69, title: '学术交流中心'},
        { x: 0.208, y: 0.477, title: '未来教室'},
        { x: 0.21, y: 0.58, title: '停车场'}
    ];
    
    // 示例：第三个地图的数据
    const huaiyuanIconData = [
        { x: 0.5, y: 0.5, icon: 'assets/img/icon/boss.png', class: 'icon-boss', title: '首领', content: '这是另一个地图的首领点。' },
        { x: 0.3, y: 0.7, icon: 'assets/img/icon/safe_box.png', class: 'icon-safe-box', title: '保险箱', content: '另一个地图的保险箱。' },
        { x: 0.8, y: 0.3, icon: 'assets/img/icon/evacuate_conditional.png', class: 'icon-evacuate', title: '撤离点', content: '另一个地图的撤离点。' }
    ];
    
    const huaiyuanLocationData = [
        { x: 0.5, y: 0.5, title: '中央广场'},
        { x: 0.3, y: 0.7, title: '北区'},
        { x: 0.8, y: 0.3, title: '南区'}
    ];
    // 所有地图的数据映射
    const mapsData = {
        'wencui': {
            imageUrl: 'assets/img/map/wencui.png',
            iconData: wencuiIconData,
            locationData: wencuiLocationData,
            name: '文萃校区'
        },
        'helanshan': {
            imageUrl: 'assets/img/map/helanshan.png',
            iconData: helanshanIconData,
            locationData: helanshanLocationData,
            name: '贺兰山校区'
        },
        'huaiyuan': {
            imageUrl: 'assets/img/map/huaiyuan.png',
            iconData: huaiyuanIconData,
            locationData: huaiyuanLocationData,
            name: '怀远校区'
        }
    };

    let nowIconData = wencuiIconData;
    let nowLocationData = wencuiLocationData;

    // 等待图片加载完成
    function initializeMap() {
        initMap();
        createIcons(nowIconData);
        createConnections();
        createLocations(nowLocationData);
        setupEventListeners();
        initializeFunctionButtons();
    }

    // 设置onload事件处理器
    // mapImg.onload = initializeMap;

    // 检查图片是否已经在缓存中完成加载
    // if (mapImg.complete) {
    //     // 如果图片已经加载完成，立即初始化
    //     initializeMap();
    // }
    
    // 启动预加载
    async function initializeApp() {
        await startPreloading();
        
        // 从本地存储读取上次选择的地图
        try {
            const savedMapId = localStorage.getItem('lastSelectedMap');
            if (savedMapId && mapsData[savedMapId]) {
                // 如果存在保存的地图且有效，则切换到该地图
                switchMap(savedMapId);
                console.log('已从本地存储加载地图:', savedMapId);
            } else {
                // 默认使用文昌校区地图
                console.log('使用默认地图: wencui');
            }
        } catch (error) {
            console.warn('读取本地存储的地图选择失败:', error);
            // 出错时继续使用默认地图
        }
    }
    
    // 初始化应用
    initializeApp();

    // 初始化地图
    function initMap() {
        // 确保地图完全显示在屏幕上
        const containerWidth = mapContainer.clientWidth;
        const containerHeight = mapContainer.clientHeight;
        const imgWidth = mapImg.naturalWidth;
        const imgHeight = mapImg.naturalHeight;
        document.querySelector('#css-map-size').textContent = `
            :root {
                --map-width: ${imgWidth}px;
                --map-height: ${imgHeight}px;
            }
        `;

        // 计算初始缩放比例，确保地图完全显示
        const scaleX = containerWidth / imgWidth;
        const scaleY = containerHeight / imgHeight;
        mapState.minScale = Math.min(scaleX, scaleY); // 使用较小的比例确保地图完全显示
        mapState.scale = mapState.minScale;

        // 计算背景色（从地图边缘提取）
        calculateBackgroundColor();

        // 居中显示地图
        updateMapTransform();
        
        // 更新滑动条
        updateZoomSlider();
    }
    
    // 计算背景色
    function calculateBackgroundColor() {
        try {
            // 创建一个临时的Canvas元素来获取地图边缘的颜色
            const canvas = document.createElement('canvas');
            // 添加willReadFrequently属性以优化getImageData性能
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            
            // 设置canvas尺寸为地图图片的尺寸
            canvas.width = mapImg.naturalWidth;
            canvas.height = mapImg.naturalHeight;
            
            // 在canvas上绘制地图图片
            ctx.drawImage(mapImg, 0, 0);
            
            // 从地图的四个角落和边缘多个点采样，以获得更准确的平均颜色
            const samplePoints = getEdgeSamplePoints(mapImg.naturalWidth, mapImg.naturalHeight);
            const colors = [];
            
            // 获取每个采样点的颜色
            samplePoints.forEach(point => {
                const imageData = ctx.getImageData(point.x, point.y, 1, 1);
                const pixelData = imageData.data;
                colors.push({
                    r: pixelData[0],
                    g: pixelData[1],
                    b: pixelData[2]
                });
            });
            
            // 计算平均颜色
            const avgColor = calculateAverageColor(colors);
            
            // 将RGB值转换为十六进制颜色字符串
            const hexColor = rgbToHex(avgColor.r, avgColor.g, avgColor.b);
            
            // 如果成功获取到颜色，则使用它
            if (hexColor) {
                mapState.backgroundColor = hexColor;
                document.body.style.backgroundColor = mapState.backgroundColor;
                return;
            }
        } catch (error) {
            console.error('Error calculating background color:', error);
        }
        
        // 如果提取颜色失败，则使用一个固定的深色作为后备选项
        mapState.backgroundColor = '#1a1a1a';
        document.body.style.backgroundColor = mapState.backgroundColor;
    }
    
    // 生成地图边缘的采样点
    function getEdgeSamplePoints(width, height) {
        const points = [];
        const sampleSize = 10; // 每个边缘的采样点数量
        const edgeMargin = 5; // 距离边缘的像素数，避免边缘可能的噪点
        
        // 上边沿
        for (let i = 0; i < sampleSize; i++) {
            points.push({
                x: Math.floor((width / (sampleSize - 1)) * i),
                y: edgeMargin
            });
        }
        
        // 右边沿
        for (let i = 0; i < sampleSize; i++) {
            points.push({
                x: width - edgeMargin - 1,
                y: Math.floor((height / (sampleSize - 1)) * i)
            });
        }
        
        // 下边沿
        for (let i = 0; i < sampleSize; i++) {
            points.push({
                x: Math.floor((width / (sampleSize - 1)) * i),
                y: height - edgeMargin - 1
            });
        }
        
        // 左边沿
        for (let i = 0; i < sampleSize; i++) {
            points.push({
                x: edgeMargin,
                y: Math.floor((height / (sampleSize - 1)) * i)
            });
        }
        
        return points;
    }
    
    // 计算颜色数组的平均值
    function calculateAverageColor(colors) {
        if (!colors || colors.length === 0) {
            return { r: 26, g: 26, b: 26 }; // 默认的深灰色
        }
        
        let sumR = 0, sumG = 0, sumB = 0;
        
        colors.forEach(color => {
            sumR += color.r;
            sumG += color.g;
            sumB += color.b;
        });
        
        const count = colors.length;
        return {
            r: Math.round(sumR / count),
            g: Math.round(sumG / count),
            b: Math.round(sumB / count)
        };
    }
    
    // 将RGB值转换为十六进制颜色字符串的辅助函数
    function rgbToHex(r, g, b) {
        return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }
    
    function componentToHex(c) {
        const hex = c.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }

    // 创建图标
    function createIcons(iconData) {
        iconData.forEach((data, index) => {
            // 创建包裹元素用于实现四角边框效果
            const iconWrapper = document.createElement('div');
            iconWrapper.className = 'icon';
            iconWrapper.dataset.index = index;
            iconWrapper.alt = data.title;
            data.class ? iconWrapper.className = 'icon ' + data.class : iconWrapper.className = 'icon';
            
            // 创建图标元素
            const icon = document.createElement('img');
            icon.src = data.icon;
            icon.style.width = '100%';
            
            // 组装DOM结构
            iconWrapper.appendChild(icon);
            
            // 设置图标位置
            updateIconPosition(iconWrapper, data);
            
            // 只有非boss图标才添加点击事件和选中状态
            if (!data.class || !data.class.includes('boss')) {
                // 添加点击事件 - 同时支持PC端和移动端
                const handleIconClick = function(e) {
                    e.stopPropagation();
                    
                    // 移除其他图标的选中状态
                    document.querySelectorAll('.icon').forEach(icon => {
                        icon.classList.remove('selected');
                    });
                    
                    // 添加当前图标的选中状态
                    this.classList.add('selected');
                    
                    showPopup(data);
                };
                
                iconWrapper.addEventListener('click', handleIconClick);
                iconWrapper.addEventListener('touchstart', handleIconClick);
            } else {
                // boss图标不可点击，添加样式标识
                iconWrapper.style.pointerEvents = 'none';
            }
            
            map.appendChild(iconWrapper);
        });
    }

    // 更新图标位置
    function updateIconPosition(icon, data) {
        const imgWidth = mapImg.naturalWidth;
        const imgHeight = mapImg.naturalHeight;
        
        // 根据相对位置计算绝对位置
        const x = data.x * imgWidth;
        const y = data.y * imgHeight;
        
        icon.style.left = `${x}px`;
        icon.style.top = `${y}px`;
    }

    // 更新所有图标位置
    function updateAllIconPositions(iconData) {
        const icons = document.querySelectorAll('.icon');
        icons.forEach(icon => {
            const index = parseInt(icon.dataset.index);
            updateIconPosition(icon, iconData[index]);
        });
        
        // 同时更新地名单据位置
        updateAllLocationNamePositions();
    }
    
    // 创建地名单据
    function createLocations(locationData) {
        // 先清除已有的地名单据
        document.querySelectorAll('.location').forEach(name => name.remove());
        
        locationData.forEach((data, index) => {
            // 创建地名元素
            const locationName = document.createElement('div');
            locationName.className = 'location';
            locationName.dataset.index = index;
            locationName.textContent = data.title;
            
            // 设置位置
            updateLocationNamePosition(locationName, data);
            
            map.appendChild(locationName);
        });
    }

    // 创建连接线
    function createConnections() {
        // 清除已有的连接线
        document.querySelectorAll('.connection-line').forEach(line => line.remove());

        // 获取所有带有icon-connect类的图标
        const connectIcons = document.querySelectorAll('.icon-connect');
        if (connectIcons.length === 0) return;

        // 分离切换点和撤离点
        const switches = Array.from(connectIcons).filter(icon => icon.classList.contains('icon-switch'));
        const evacuates = Array.from(connectIcons).filter(icon => icon.classList.contains('icon-evacuate'));

        // 为每对切换点和撤离点创建连接线
        switches.forEach(switchIcon => {
            evacuates.forEach(evacuateIcon => {
                createConnectionLine(switchIcon, evacuateIcon);
            });
        });

        setTimeout(() => {
            updateAllConnections();
        }, 100);
    }

    // 创建单条连接线
    function createConnectionLine(fromIcon, toIcon) {
        const line = document.createElement('div');
        line.className = 'connection-line';
        map.appendChild(line);

        // 更新连接线位置
        updateConnectionLine(fromIcon, toIcon, line);
    }

    // 更新连接线位置和尺寸
    function updateConnectionLine(fromIcon, toIcon, line) {
        // 获取图标中心相对于地图的位置（不考虑缩放和平移）
        const fromX = parseFloat(fromIcon.style.left);
        const fromY = parseFloat(fromIcon.style.top);
        const toX = parseFloat(toIcon.style.left);
        const toY = parseFloat(toIcon.style.top);

        // 计算距离和角度
        const dx = toX - fromX;
        const dy = toY - fromY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        // console.log(dx, dy, distance, angle);

        // 设置连接线样式
        line.style.width = `${distance}px`;
        line.style.left = `${fromX}px`;
        line.style.top = `${fromY}px`;
        line.style.transform = `rotate(${angle}deg)`;
    }

    // 更新所有连接线
    function updateAllConnections() {
        // console.log('更新所有连接线');
        const lines = document.querySelectorAll('.connection-line');
        if (lines.length === 0) return;

        // 获取所有带有icon-connect类的图标
        const connectIcons = document.querySelectorAll('.icon-connect');
        const switches = Array.from(connectIcons).filter(icon => icon.classList.contains('icon-switch'));
        const evacuates = Array.from(connectIcons).filter(icon => icon.classList.contains('icon-evacuate'));

        // 更新每条连接线
        let index = 0;
        switches.forEach(switchIcon => {
            evacuates.forEach(evacuateIcon => {
                if (index < lines.length) {
                    updateConnectionLine(switchIcon, evacuateIcon, lines[index]);
                    index++;
                }
            });
        });
    }
    
    // 更新地名单据位置
    function updateLocationNamePosition(locationName, data) {
        const imgWidth = mapImg.naturalWidth;
        const imgHeight = mapImg.naturalHeight;
        
        // 根据相对位置计算绝对位置
        const x = data.x * imgWidth;
        const y = data.y * imgHeight;
        
        // 与图标位置计算逻辑完全保持一致
        // 使用与图标完全相同的定位方式和偏移量，确保在相同参考点上显示
        locationName.style.left = `${x}px`; // 与图标使用相同的水平偏移
        locationName.style.top = `${y}px`;  // 与图标使用相同的垂直偏移
    }
    
    // 更新所有地名单据位置
    function updateAllLocationNamePositions() {
        const locationNames = document.querySelectorAll('.location');
        locationNames.forEach(name => {
            const index = parseInt(name.dataset.index);
            updateLocationNamePosition(name, locationData[index]);
        });
    }

    // 显示弹窗
    function showPopup(data) {
        popupTitle.textContent = data.title;
        popupContent.innerHTML = data.content;
        popup.style.display = 'block';
    }

    // 隐藏弹窗
    function hidePopup() {
        popup.style.display = 'none';
        
        // 隐藏弹窗时移除所有图标的选中状态
        document.querySelectorAll('.icon').forEach(icon => {
            icon.classList.remove('selected');
        });
    }

    // 更新地图变换
    function updateMapTransform(isDragging = false) {
        // 计算边界限制
        const containerWidth = mapContainer.clientWidth;
        const containerHeight = mapContainer.clientHeight;
        const imgWidth = mapImg.naturalWidth * mapState.scale;
        const imgHeight = mapImg.naturalHeight * mapState.scale;
        
        // 确保地图不会移出视图
        if (imgWidth > containerWidth) {
            mapState.translateX = Math.min(0, Math.max(containerWidth - imgWidth, mapState.translateX));
        } else {
            mapState.translateX = (containerWidth - imgWidth) / 2;
        }
        
        if (imgHeight > containerHeight) {
            mapState.translateY = Math.min(0, Math.max(containerHeight - imgHeight, mapState.translateY));
        } else {
            mapState.translateY = (containerHeight - imgHeight) / 2;
        }
        
        // 在拖动时禁用过渡效果，缩放时启用
        if (isDragging) {
            map.style.transition = 'none';
        } else {
            map.style.transition = 'transform 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)';
        }
        
        // 应用变换，使用transform的will-change属性和硬件加速来减少停顿感
        map.style.transform = `translate3d(${mapState.translateX}px, ${mapState.translateY}px, 0) scale(${mapState.scale})`;
        map.style.willChange = 'transform';
        
        // 更新滑动条
        updateZoomSlider();
        
        // 更新连接线
        // updateAllConnections();
    }
    
    // 更新缩放滑动条
    function updateZoomSlider() {
        const sliderFill = document.getElementById('zoom-slider-fill');
        const sliderThumb = document.getElementById('zoom-slider-thumb');
        const sliderContainer = document.querySelector('.zoom-slider-container');
        
        if (!sliderFill || !sliderThumb || !sliderContainer) return;
        
        // 计算滑动条高度比例
        const range = mapState.maxScale - mapState.minScale;
        const percent = (mapState.scale - mapState.minScale) / range;
        const height = sliderContainer.clientHeight;
        
        // 更新填充高度和滑块位置
        const fillHeight = percent * height;
        sliderFill.style.height = `${fillHeight}px`;
        sliderThumb.style.bottom = `${fillHeight}px`;
    }

    // 存储添加的事件监听器，以便后续移除
    const eventListeners = [];
    
    // 添加事件监听器并存储引用
    function addEventListener(element, event, handler, options = {}) {
        element.addEventListener(event, handler, options);
        eventListeners.push({ element, event, handler, options });
    }
    
    // 移除所有存储的事件监听器
    function removeAllEventListeners() {
        eventListeners.forEach(listener => {
            try {
                listener.element.removeEventListener(listener.event, listener.handler, listener.options);
            } catch (error) {
                // 忽略已被移除的元素的错误
                console.warn('Failed to remove event listener:', error);
            }
        });
        eventListeners.length = 0; // 清空数组
    }
    
    // 设置事件监听器
    function setupEventListeners() {
        // 移除之前可能存在的事件监听器
        removeAllEventListeners();
        
        // 鼠标拖动
        addEventListener(map, 'mousedown', startDrag);
        addEventListener(document, 'mousemove', drag);
        addEventListener(document, 'mouseup', endDrag);
        
        // 触摸拖动
        addEventListener(map, 'touchstart', startDrag);
        addEventListener(document, 'touchmove', drag);
        addEventListener(document, 'touchend', endDrag);
        
        // 鼠标滚轮缩放 - 使用passive: false减少延迟
        addEventListener(mapContainer, 'wheel', zoom, { passive: false });
        
        // 缩放按钮
        addEventListener(zoomIn, 'click', () => zoomByButton(0.8));
        addEventListener(zoomOut, 'click', () => zoomByButton(-0.5));
        
        // 关闭弹窗
        addEventListener(popupClose, 'click', hidePopup);
        
        // 滑动条交互
        const sliderThumb = document.getElementById('zoom-slider-thumb');
        const sliderContainer = document.querySelector('.zoom-slider-container');
        
        if (sliderThumb && sliderContainer) {
            let isDraggingSlider = false;
            
            // 滑动条点击
            addEventListener(sliderContainer, 'click', function(e) {
                const rect = sliderContainer.getBoundingClientRect();
                const clickY = e.clientY - rect.top;
                const height = rect.height;
                const percent = 1 - (clickY / height);
                
                // 计算新的缩放比例
                const range = mapState.maxScale - mapState.minScale;
                const newScale = mapState.minScale + (percent * range);
                
                // 以屏幕中心为缩放点
                const centerX = mapContainer.clientWidth / 2;
                const centerY = mapContainer.clientHeight / 2;
                
                // 使用requestAnimationFrame确保平滑过渡
                requestAnimationFrame(() => {
                    setZoomScale(newScale, centerX, centerY);
                    // 确保应用过渡效果
                    updateMapTransform(false);
                });
            });
            
            // 滑块拖动 - 同时支持PC端和移动端
                const handleSliderDrag = function(e) {
                    if (!isDraggingSlider) return;
                    
                    // 获取鼠标或触摸位置
                    let clientY;
                    if (e.type.includes('mouse')) {
                        clientY = e.clientY;
                    } else if (e.type.includes('touch')) {
                        clientY = e.touches[0].clientY;
                        e.preventDefault(); // 防止页面滚动
                    }
                    
                    const rect = sliderContainer.getBoundingClientRect();
                    const dragY = clientY - rect.top;
                    const height = rect.height;
                    let percent = 1 - (dragY / height);
                    
                    // 限制在0-1范围内
                    percent = Math.max(0, Math.min(1, percent));
                    
                    // 计算新的缩放比例
                    const range = mapState.maxScale - mapState.minScale;
                    const newScale = mapState.minScale + (percent * range);
                    
                    // 以屏幕中心为缩放点
                    const centerX = mapContainer.clientWidth / 2;
                    const centerY = mapContainer.clientHeight / 2;
                    
                    // 使用requestAnimationFrame确保平滑过渡
                    requestAnimationFrame(() => {
                        setZoomScale(newScale, centerX, centerY);
                        // 确保应用过渡效果
                        updateMapTransform(false);
                    });
                };
                
                const handleSliderDragStart = function(e) {
                    e.stopPropagation();
                    isDraggingSlider = true;
                    if (e.type.includes('touch')) {
                        e.preventDefault(); // 防止页面滚动
                    }
                };
                
                const handleSliderDragEnd = function() {
                    isDraggingSlider = false;
                    // 确保拖动结束后应用过渡效果
                    updateMapTransform(false);
                };
                
                // 添加鼠标事件
                addEventListener(sliderThumb, 'mousedown', handleSliderDragStart);
                addEventListener(document, 'mousemove', handleSliderDrag);
                addEventListener(document, 'mouseup', handleSliderDragEnd);
                
                // 添加触摸事件（支持移动端）
                addEventListener(sliderThumb, 'touchstart', handleSliderDragStart, { passive: false });
                addEventListener(document, 'touchmove', handleSliderDrag, { passive: false });
                addEventListener(document, 'touchend', handleSliderDragEnd);
        }
        
        // 移动端双指缩放
        let lastTouchDistance = 0;
        addEventListener(mapContainer, 'touchstart', function(e) {
            if (e.touches.length === 2) {
                lastTouchDistance = getTouchDistance(e.touches);
            }
        });
        
        addEventListener(mapContainer, 'touchmove', function(e) {
            if (e.touches.length === 2) {
                const currentDistance = getTouchDistance(e.touches);
                const delta = currentDistance - lastTouchDistance;
                
                // 计算缩放因子
                const zoomFactor = delta * 0.01;
                
                // 计算两个触摸点的中心作为缩放锚点
                const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
                
                // 以触摸点中心为锚点进行缩放
                zoomByFactor(zoomFactor, centerX, centerY);
                
                lastTouchDistance = currentDistance;
                e.preventDefault(); // 防止页面滚动
            }
        }, { passive: false });
        
        // 窗口大小改变时重新计算
        addEventListener(window, 'resize', function() {
            initMap();
            updateAllIconPositions(nowIconData);
        });
    }
    
    // 直接设置缩放比例
    function setZoomScale(newScale, clientX, clientY) {
        // 限制在最小和最大缩放比例之间
        newScale = Math.max(mapState.minScale, Math.min(mapState.maxScale, newScale));
        
        // 如果缩放比例没有变化，则不进行操作
        if (newScale === mapState.scale) return;
        
        // 如果提供了缩放点，则以该点为中心进行缩放
        if (clientX !== undefined && clientY !== undefined) {
            // 计算鼠标相对于地图原点的位置（考虑当前缩放和平移）
            const mouseXRelToOrigin = (clientX - mapState.translateX) / mapState.scale;
            const mouseYRelToOrigin = (clientY - mapState.translateY) / mapState.scale;
            
            // 计算新的平移量，使鼠标位置保持在同一点
            mapState.translateX = clientX - mouseXRelToOrigin * newScale;
            mapState.translateY = clientY - mouseYRelToOrigin * newScale;
        }
        
        // 更新缩放比例
        mapState.scale = newScale;
        
        // 应用变换，确保使用过渡效果
        updateMapTransform(false);
    }

    // 开始拖动
    function startDrag(e) {
        e.preventDefault();
        mapState.isDragging = true;
        map.classList.add('grabbing');
        
        // 拖动时自动关闭弹窗
        // hidePopup();
        
        if (e.type === 'mousedown') {
            mapState.lastPosX = e.clientX;
            mapState.lastPosY = e.clientY;
        } else if (e.type === 'touchstart' && e.touches.length === 1) {
            mapState.lastPosX = e.touches[0].clientX;
            mapState.lastPosY = e.touches[0].clientY;
        }
    }

    // 拖动中
    function drag(e) {
        if (!mapState.isDragging) return;
        e.preventDefault();
        
        let currentX, currentY;
        if (e.type === 'mousemove') {
            currentX = e.clientX;
            currentY = e.clientY;
        } else if (e.type === 'touchmove' && e.touches.length === 1) {
            currentX = e.touches[0].clientX;
            currentY = e.touches[0].clientY;
        } else {
            return;
        }
        
        // 计算移动距离
        const deltaX = currentX - mapState.lastPosX;
        const deltaY = currentY - mapState.lastPosY;
        // console.log(deltaX, deltaY);
        
        // 更新位置
        mapState.translateX += deltaX;
        mapState.translateY += deltaY;
        
        // 更新参考点
        mapState.lastPosX = currentX;
        mapState.lastPosY = currentY;
        
        // 应用变换
        updateMapTransform(true);
    }

    // 结束拖动
    function endDrag() {
        mapState.isDragging = false;
        map.classList.remove('grabbing');
        // 拖动结束后恢复过渡效果
        updateMapTransform(false);
    }

    // 鼠标滚轮缩放
    function zoom(e) {
        e.preventDefault();
        
        // 确定缩放方向和大小，使用适当的缩放因子
        const delta = -Math.sign(e.deltaY) * 0.2; // 增加缩放步长，使每次缩放更明显
        const newScale = mapState.scale * (1 + delta);
        
        // 使用requestAnimationFrame优化性能
        requestAnimationFrame(() => {
            // 以鼠标位置为锚点进行缩放
            setZoomScale(newScale, e.clientX, e.clientY);
            // 确保应用过渡效果
            updateMapTransform(false);
        });
    }

    // 按钮缩放
    function zoomByButton(delta) {
        // 以屏幕中心为缩放点
        const centerX = mapContainer.clientWidth / 2;
        const centerY = mapContainer.clientHeight / 2;
        const newScale = mapState.scale * (1 + delta);
        
        // 使用requestAnimationFrame优化性能
        requestAnimationFrame(() => {
            setZoomScale(newScale, centerX, centerY);
            // 确保应用过渡效果
            updateMapTransform(false);
        });
    }

    // 按因子缩放 - 保留此函数以兼容现有代码，但内部使用setZoomScale
    function zoomByFactor(delta, clientX, clientY) {
        const newScale = mapState.scale * (1 + delta);
        setZoomScale(newScale, clientX, clientY);
    }

    // 计算两个触摸点之间的距离
    function getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // 获取DOM元素
    const mapSelectPopup = document.getElementById('map-select-popup');
    const mapSelectClose = document.getElementById('map-select-close');
    const mapOptions = document.querySelectorAll('.map-option');
    
    // 显示地图选择弹窗
    function showMapSelectPopup() {
        mapSelectPopup.style.display = 'block';
    }
    
    // 隐藏地图选择弹窗
    function hideMapSelectPopup() {
        mapSelectPopup.style.display = 'none';
    }
    
    // 切换地图
    function switchMap(mapId) {
        const mapData = mapsData[mapId];
        if (!mapData) {
            console.error('地图数据不存在:', mapId);
            return;
        }
        
        // 保存到本地存储
        try {
            localStorage.setItem('lastSelectedMap', mapId);
            console.log('已保存地图选择到本地存储:', mapId);
        } catch (error) {
            console.warn('保存地图选择到本地存储失败:', error);
        }
        
        // 隐藏弹窗
        hideMapSelectPopup();
        
        // 为body添加背景色过渡效果
        document.body.style.transition = 'background-color 0.25s ease-in-out';
        
        // 添加淡出动画效果
        map.style.transition = 'opacity 0.25s ease-out';
        map.style.opacity = '0';
        
        // 延迟清理资源和加载新地图，等待淡出动画完成
        setTimeout(() => {
            // 清理旧资源
            resetMap();
            
            // 更新当前使用的数据
            nowIconData = mapData.iconData;
            nowLocationData = mapData.locationData;
            
            // 创建一个新的Image对象来预加载新地图图片
            const tempImg = new Image();
            tempImg.onload = function() {
                // 当新地图图片加载完成后，设置新图片
                mapImg.src = mapData.imageUrl;
                
                // 使用setTimeout确保浏览器有足够时间处理图片更新
                setTimeout(() => {
                    // 重新初始化地图，但不立即显示
                    initializeMap();
                    
                    // 添加淡入动画效果
                    map.style.opacity = '1';
                    map.style.transition = 'opacity 0.25s ease-in';
                    
                    console.log('已切换到地图:', mapData.name);
                }, 100);
            };
            tempImg.onerror = function() {
                console.error('加载地图图片失败:', mapData.imageUrl);
                // 即使加载失败也尝试初始化并显示
                initializeMap();
                map.style.opacity = '1';
            };
            tempImg.src = mapData.imageUrl;
        }, 300); // 等待淡出动画完成
    }
    
    // 重置地图
    function resetMap() {
        // 隐藏弹窗
        hidePopup();
        
        // 移除所有图标
        const icons = document.querySelectorAll('.icon');
        icons.forEach(icon => {
            try {
                icon.remove();
            } catch (e) {
                console.warn('移除图标失败:', e);
            }
        });
        
        // 移除所有连接线
        const connections = document.querySelectorAll('.connection-line');
        connections.forEach(connection => {
            try {
                connection.remove();
            } catch (e) {
                console.warn('移除连接线失败:', e);
            }
        });
        
        // 移除所有地名
        const locations = document.querySelectorAll('.location');
        locations.forEach(location => {
            try {
                location.remove();
            } catch (e) {
                console.warn('移除地名失败:', e);
            }
        });
        
        // 重置地图状态
        mapState.scale = 1;
        mapState.translateX = 0;
        mapState.translateY = 0;
        mapState.isDragging = false;
        
        // 清除所有事件监听器
        removeAllEventListeners();
    }
    
    // 初始化功能按钮
    function initializeFunctionButtons() {
        // 获取导出图片按钮
        const exportImageBtn = document.getElementById('export-image-btn');
        if (exportImageBtn) {
            // 为导出图片按钮添加点击事件
            addEventListener(exportImageBtn, 'click', async function() {
                // 目前不需要实现具体的导出逻辑
                console.log('导出图片按钮被点击');
                const el = document.querySelector('#map-container');
                await snapdom.download(el, {
                    format: 'png',
                    filename: 'map',
                    scale: 2.5,
                    quality: 1
                })
            });
        }
        
        // 获取选择地图按钮
        const selectMapBtn = document.getElementById('select-map-btn');
        if (selectMapBtn) {
            // 为选择地图按钮添加点击事件
            addEventListener(selectMapBtn, 'click', showMapSelectPopup);
        }
        
        // 添加地图选择弹窗关闭事件
        const mapSelectClose = document.getElementById('map-select-close');
        if (mapSelectClose) {
            addEventListener(mapSelectClose, 'click', hideMapSelectPopup);
        }
        
        // 添加地图选项点击事件
        const mapOptions = document.querySelectorAll('.map-option');
        mapOptions.forEach(option => {
            addEventListener(option, 'click', function() {
                const mapId = this.dataset.mapId;
                switchMap(mapId);
            });
        });
        
        // 点击弹窗外部关闭弹窗
        const mapSelectPopup = document.getElementById('map-select-popup');
        if (mapSelectPopup) {
            addEventListener(mapSelectPopup, 'click', function(e) {
                if (e.target === this) {
                    hideMapSelectPopup();
                }
            });
        }
    }
});