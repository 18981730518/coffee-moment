export const AppState = {
    mode: 0, 
    progress: 1.0, // 改为 1.0，开局模型完整显现
    animSpeed: 5.0, 
    speedCurve: 1.5,
    
    rotSpeed: 1.0,
    camSpeed: 1.0, 
    camMin: 1.0,  
    camMax: 12.0, 
    
    curve: [0.42, 0.0, 0.58, 1.0], 
    
    scanAxis: 0, 
    scanMin: -2.0, 
    scanMax: 2.0,  
    
    noiseScale: 1.2, 
    noiseEdge: 0.4, 
    
    persistence: 0.0, 
    fadePower: 1.2,   
    
    pointSize: 0.50,  
    bloomStrength: 0.10, 
    exposure: 1.00,   
    damp: 0.80, // 锁定为极小值 0.80，且从 UI 移除
    
    brightness: 1.0, 
    contrast: 1.0, 
    saturation: 1.0
};

export const SysState = {
    isAutoAnimating: false,
    simulationTime: 0,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
};
