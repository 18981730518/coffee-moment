import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { AppState, SysState } from './config.js';
import { initEngine, createPoints, updateEngineCore, playCameraMove, renderer, composer, camera, controls } from './engine.js';

const clock = new THREE.Clock();
let progressTween = null;

function initUI() {
    document.querySelectorAll('input[data-key]').forEach(input => {
        const key = input.dataset.key;
        if(AppState[key] !== undefined) input.value = AppState[key];
        
        input.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value); 
            AppState[key] = val;
            
            if (key === 'progress') {
                document.querySelectorAll('input[data-key="progress"]').forEach(el => {
                    if(el !== e.target) el.value = val;
                });
                document.querySelectorAll('.progress-val-text').forEach(el => el.innerText = val.toFixed(3));
                if(SysState.isAutoAnimating) stopAutoAnimate();
            } else {
                const display = document.getElementById(key + '-val'); 
                if(display) display.innerText = val.toFixed(2);
            }

            if(key === 'rotSpeed') controls.autoRotateSpeed = val;
            if(key === 'animSpeed' && SysState.isAutoAnimating) playEvolveAnimation();
        });
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight; 
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight); 
        composer.setSize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener('keydown', (e) => { 
        if(e.key.toLowerCase() === 'h') document.getElementById('ui-container').classList.toggle('hidden-ui'); 
    });

    document.getElementById('ply-upload').addEventListener('change', (e) => {
        const file = e.target.files[0]; if (!file) return;
        const overlay = document.getElementById('loader-overlay'); 
        overlay.classList.add('active');
        setTimeout(() => {
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const geometry = new PLYLoader().parse(event.target.result); 
                    createPoints(geometry, false);
                    
                    // 每次导入新模型，强制重置为 1.0（完全显现）
                    AppState.progress = 1.0; 
                    document.querySelectorAll('input[data-key="progress"]').forEach(el => el.value = 1);
                    document.querySelectorAll('.progress-val-text').forEach(el => el.innerText = "1.000");
                    document.querySelectorAll('.cam-btn').forEach(b => b.classList.remove('active-cam'));
                } catch (err) { alert("模型解析失败，请确保上传的是正确的 .ply 文件。"); }
                overlay.classList.remove('active');
            };
            reader.readAsArrayBuffer(file);
        }, 50);
    });

    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active'); AppState.mode = parseInt(e.target.dataset.mode);
        });
    });

    document.querySelectorAll('.cam-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.cam-btn').forEach(b => b.classList.remove('active-cam'));
            e.target.classList.add('active-cam');
            playCameraMove(parseInt(e.target.dataset.cam));
        });
    });
    
    document.querySelectorAll('.axis-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.axis-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active'); AppState.scanAxis = parseInt(e.target.dataset.axis);
        });
    });

    const btnCamStop = document.getElementById('btn-cam-stop');
    if (btnCamStop) {
        btnCamStop.addEventListener('click', () => {
            document.querySelectorAll('.cam-btn').forEach(b => b.classList.remove('active-cam'));
            playCameraMove(0); 
        });
    }

    document.getElementById('auto-animate').addEventListener('click', (e) => {
        SysState.isAutoAnimating = !SysState.isAutoAnimating;
        if(SysState.isAutoAnimating) { 
            e.target.innerHTML = "⏸ 暂停自动播放"; e.target.classList.add('bg-cyan-600', 'text-white');
            playEvolveAnimation(); 
        } else {
            stopAutoAnimate();
        }
    });
}

function stopAutoAnimate() {
    SysState.isAutoAnimating = false;
    document.getElementById('auto-animate').innerHTML = "▶ 自动播放消散动画"; 
    document.getElementById('auto-animate').classList.remove('bg-cyan-600', 'text-white');
    if(progressTween) progressTween.pause(); 
}

function playEvolveAnimation() {
    if(progressTween) progressTween.kill();
    if(!window.gsap) return;

    const easeStr = `cubic-bezier(${AppState.curve[0]}, ${AppState.curve[1]}, ${AppState.curve[2]}, ${AppState.curve[3]})`;
    
    progressTween = window.gsap.fromTo(AppState, 
        { progress: 1 }, // 从完全显现 (1) 开始
        { 
            progress: 0, // 演化到完全消散 (0)
            duration: AppState.animSpeed, 
            ease: easeStr, 
            repeat: -1, 
            yoyo: true, 
            onUpdate: () => {
                document.querySelectorAll('input[data-key="progress"]').forEach(el => el.value = AppState.progress);
                document.querySelectorAll('.progress-val-text').forEach(el => el.innerText = AppState.progress.toFixed(3));
            }
        }
    );
}

initEngine(); 
initUI(); 
animate();

function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta(); 
    SysState.simulationTime += dt;
    updateEngineCore(); 
    composer.render();
}