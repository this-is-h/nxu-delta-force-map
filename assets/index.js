document.addEventListener('DOMContentLoaded', function() {
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
        { x: 0.73, y: 0.443, icon: 'assets/img/icon/boss.png', class: 'icon-boss', title: '首领', content: '这是一个首领点，可以在这里挑战强大的敌人。' },
        { x: 0.72, y: 0.48, icon: 'assets/img/icon/safe_box.png', class: 'icon-safe-box', title: '保险箱', content: '高价值容器<div class="divider"></div>高概率出现<div class="rewards"><img class="back-red" src="assets/img/rewards/heart-of-africa.png"></img><img class="back-red" src="assets/img/rewards/bust-of-claudius.png"></img><img class="back-red" src="assets/img/rewards/golden-gazelle.png"></img><img class="back-red" src="assets/img/rewards/precious-mechanical-watch.png"></img></div>' },
        { x: 0.7335, y: 0.4095, icon: 'assets/img/icon/small_safe_box.png', class: 'icon-safe-box', title: '骇客电脑', content: '高价值容器<div class="divider"></div>高概率出现<div class="rewards"><img class="back-red" src="assets/img/rewards/mandel-supercomputing-unit.png"></img><img class="back-red" src="assets/img/rewards/experimental-data.png"></img><img class="back-red" src="assets/img/rewards/quantum-storage.png"></img></div>' },
        { x: 0.35, y: 0.3415, icon: 'assets/img/icon/boss.png', class: 'icon-boss', title: '首领', content: '这是一个首领点，可以在这里挑战强大的敌人。' },
        { x: 0.3425, y: 0.29, icon: 'assets/img/icon/safe_box.png', class: 'icon-safe-box', title: '保险箱', content: '这里有一个保险箱，可能包含有价值的物品。' },
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
        { x: 0.1135, y: 0.6, icon: 'assets/img/icon/task.png', class: 'icon-task', title: '任务', content: '这里有一个任务等待完成。' },
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

    let nowIconData = wencuiIconData;
    let nowLocationData = wencuiLocationData;

    // 等待图片加载完成
    function initializeMap() {
        initMap();
        createIcons(nowIconData);
        createConnections();
        createLocations(nowLocationData);
        setupEventListeners();
    }

    // 设置onload事件处理器
    mapImg.onload = initializeMap;

    // 检查图片是否已经在缓存中完成加载
    if (mapImg.complete) {
        // 如果图片已经加载完成，立即初始化
        initializeMap();
    }

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
            const ctx = canvas.getContext('2d');
            
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

    // 设置事件监听器
    function setupEventListeners() {
        // 鼠标拖动
        map.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', endDrag);
        
        // 触摸拖动
        map.addEventListener('touchstart', startDrag);
        document.addEventListener('touchmove', drag);
        document.addEventListener('touchend', endDrag);
        
        // 鼠标滚轮缩放 - 使用passive: false减少延迟
        mapContainer.addEventListener('wheel', zoom, { passive: false });
        
        // 缩放按钮
        zoomIn.addEventListener('click', () => zoomByButton(0.8));
        zoomOut.addEventListener('click', () => zoomByButton(-0.5));
        
        // 关闭弹窗
        popupClose.addEventListener('click', hidePopup);
        
        // 滑动条交互
        const sliderThumb = document.getElementById('zoom-slider-thumb');
        const sliderContainer = document.querySelector('.zoom-slider-container');
        
        if (sliderThumb && sliderContainer) {
            let isDraggingSlider = false;
            
            // 滑动条点击
            sliderContainer.addEventListener('click', function(e) {
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
                sliderThumb.addEventListener('mousedown', handleSliderDragStart);
                document.addEventListener('mousemove', handleSliderDrag);
                document.addEventListener('mouseup', handleSliderDragEnd);
                
                // 添加触摸事件（支持移动端）
                sliderThumb.addEventListener('touchstart', handleSliderDragStart, { passive: false });
                document.addEventListener('touchmove', handleSliderDrag, { passive: false });
                document.addEventListener('touchend', handleSliderDragEnd);
        }
        
        // 移动端双指缩放
        let lastTouchDistance = 0;
        mapContainer.addEventListener('touchstart', function(e) {
            if (e.touches.length === 2) {
                lastTouchDistance = getTouchDistance(e.touches);
            }
        });
        
        mapContainer.addEventListener('touchmove', function(e) {
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
        window.addEventListener('resize', function() {
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
});