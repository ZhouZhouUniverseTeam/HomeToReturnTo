<template>
  <div>
    <Loading v-if="!isLoadingEnd"></Loading>
    <div class="home-page" id="home-page">
      <div id="canvas-box"></div>
      <Transition name="detail-box" mode="out-in">
        <div class="rubbish-detail" v-if="isShowDetailBox">
          <RubbishDetail
            :currentType="currentType"
            @closeDetailBox="closeDetailBox"
            :trashCanColor="trashCanColor"
            :rubbishName="rubbishName"
          />
        </div>
      </Transition>

      <div id="tooltip" ref="tooltip"></div>

      <RightButtonLink
        v-for="(item, index) in rightButtons"
        :key="index"
        :style="{ top: index * 100 + 100 + 'px' }"
        :class="[rightButtonActiveIndex === index ? 'active' : '']"
        @mouseenter="handleShowActiveClass(index)"
        @mouseleave="handleHideActiveClass"
        :to="item.path"
      >
        {{ item.text }}
      </RightButtonLink>

      <div class="search">
        <SearchRubbish @openDetailBox="openDetailBox"></SearchRubbish>
      </div>
    </div>
  </div>
</template>

<script>
import * as THREE from "three";
import {
  Mesh,
  MeshLambertMaterial,
  PlaneGeometry,
  Raycaster,
  Vector2,
} from "three";

// obj加载模型方法
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { nextTick, onMounted, onUnmounted, ref } from "vue";
// import "../../../public/models/trash_can/scene.gltf";
// 引入用户年龄饼图组件
// import UserAgeDistribute from "./components/userAgeDistribute/index.vue";
import RubbishDetail from "../../components/RubbishDetail/index.vue";
import SearchRubbish from "../../components/SearchRubbish/index.vue";
import RightButtonLink from "../../components/RightButtonLink/index.vue";
// import Stats from "three/examples/jsm/libs/stats.module";
import Loading from "../../components/Loading/index.vue";

export default {
  name: "Home",
  components: {
    // UserAgeDistribute,
    RubbishDetail,
    SearchRubbish,
    RightButtonLink,
    Loading,
  },
  setup() {
    // 并非所有浏览器都支持WebGL，事实上，目前只有chrome和firefox可以使用三.js WebGLRenderer。iOS 可与画布渲染器配合使用，尽管 IE9 支持画布，但它不支持工作线程，因此目前不支持。

    // 创建场景,创建相机,创建渲染器
    let scene, camera, renderer;
    // 创建光源
    let point, pointLight;
    // 获取浏览器宽
    let width = window.innerWidth;
    // 获取浏览器高
    let height = window.innerHeight;
    // 存储鼠标在浏览器可视区中的坐标
    let mouseY = 0,
      mouseX = -400;
    // 计算浏览器宽高 / 2
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;

    // 射线 鼠标拾取坐标
    let raycaster = new Raycaster();
    let INTERSECTED;
    let raycasterMouse = new Vector2();

    // 第二个射线保存的模型
    let INTERSECTED2;

    // 加载器
    let loader;

    // 地面几何模型
    let groundGeometry;

    // 初始化射线接触到的模型
    let intersects;

    // 显示/隐藏弹出盒子
    let isShowDetailBox = ref(false);

    // 当前点击的垃圾桶类型
    let currentType = ref("");

    // 显示/隐藏上拉弹出框
    let isActive = false;

    //初始化性能插件
    // let stats;

    // 鼠标移入模型显示垃圾桶类型
    let tooltip = ref(null);

    // 保存垃圾桶颜色
    let trashCanColor = ref();

    // 搜索垃圾名称
    let rubbishName = ref();

    let particles,
      particle,
      count = 0;

    let SEPARATION = 100,
      AMOUNTX = 50,
      AMOUNTY = 50;

    let vertex = document.createElement("script");
    vertex.type = "x-shader/x-vertex";
    vertex.id = "vertexshader";
    vertex.innerHTML = `attribute float scale;

\t\t\tvoid main() {

\t\t\t\tvec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

\t\t\t\tgl_PointSize = scale * ( 300.0 / - mvPosition.z );

\t\t\t\tgl_Position = projectionMatrix * mvPosition;

\t\t\t}`;
    document.body.appendChild(vertex);

    let fragment = document.createElement("script");
    fragment.type = "x-shader/x-fragment";
    fragment.id = "fragmentshader";
    fragment.innerHTML = `uniform vec3 color;

\t\t\tvoid main() {

\t\t\t\tif ( length( gl_PointCoord - vec2( 0.5, 0.5 ) ) > 0.475 ) discard;

\t\t\t\tgl_FragColor = vec4( color, 1.0 );

\t\t\t}`;
    document.body.appendChild(fragment);

    // 创建初始化函数
    function init() {
      // // 场景的背景图片路径
      // let r = "textures/skybox/";
      // // 场景背景图片名称
      // let urls = [
      //   r + "right.jpg",
      //   r + "left.jpg",
      //   r + "top.jpg",
      //   r + "bottom.jpg",
      //   r + "front.jpg",
      //   r + "back.jpg",
      // ];

      // 初始化加载器，加载场景背景图片
      // let textureCube = new THREE.CubeTextureLoader().load(urls);
      // textureCube.mapping = THREE.CubeRefractionMapping;
      let sceneBackgroundColor = new THREE.Color(0x000000);
      // 创建场景
      scene = new THREE.Scene();
      // 给场景添加背景
      scene.background = sceneBackgroundColor;
      // 初始化
      initCamera();
      initPoint();
      // initGround();
      // axis();
      // initStats();
      setRaycaster();
      initWave();

      // 创建渲染器
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      // 设置渲染器大小
      renderer.setSize(width, height);
      // 设置背景颜色
      renderer.setClearColor(0x000000, 1);
      // 模型开启阴影
      renderer.shadowMap.enabled = true;
      //取消Threejs帧缓冲区数据自动清除功能
      renderer.autoClear = false;

      let cubeMaterial1 = new THREE.MeshLambertMaterial({
        color: 0xffffff,
      });

      // 创建loader变量，用于导入模型
      loader = new GLTFLoader();
      // 加载模型
      loader.load("/models/trash_can_Green/untitleda.gltf", function (gltf) {
        loadTrashCan1(gltf, cubeMaterial1);
      });
      // 加载模型
      loader.load("/models/trash_can_Black/untitled.gltf", function (gltf) {
        loadTrashCan2(gltf, cubeMaterial1);
      });
      // 加载模型
      loader.load("/models/trash_can_Blue/untitled.gltf", function (gltf) {
        loadTrashCan3(gltf, cubeMaterial1);
      });
      // 加载模型
      loader.load("/models/trash_can_Grey/untitled.gltf", function (gltf) {
        loadTrashCan4(gltf, cubeMaterial1);
      });

      // 添加控件
      // - 第一个参数相机
      // - 第二个参数，canvas元素
      // new OrbitControls(camera, renderer.domElement);
      document.addEventListener("mousemove", onDocumentMouseMove, false);

      // 监听浏览器可视区变化
      window.onresize = onWindowResize;

      renderer.domElement.addEventListener("click", onRaycasterClick);
      renderer.domElement.addEventListener("mousemove", onRaycasterMouseMove);

      document.getElementById("canvas-box").innerHTML = "";
      document.getElementById("canvas-box").appendChild(renderer.domElement);
    }

    // 初始化相机
    function initCamera() {
      // 创建相机对象
      camera = new THREE.PerspectiveCamera(50, width / height, 1, 100000);
      // 设置相机位置
      camera.position.set(-2000, 0, 600);
      // 设置相机方向(指向场景的的坐标)
      camera.lookAt(scene.position);
    }

    // 初始化波浪
    function initWave() {
      //

      const numParticles = AMOUNTX * AMOUNTY;

      const positions = new Float32Array(numParticles * 3);
      const scales = new Float32Array(numParticles);

      let i = 0,
        j = 0;

      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          positions[i] = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2; // x
          positions[i + 1] = 0; // y
          positions[i + 2] = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2; // z

          scales[j] = 1;

          i += 3;
          j++;
        }
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
      geometry.setAttribute("scale", new THREE.BufferAttribute(scales, 1));

      const material = new THREE.ShaderMaterial({
        uniforms: {
          color: { value: new THREE.Color(0x047ed6) },
        },
        vertexShader: document.getElementById("vertexshader").textContent,
        fragmentShader: document.getElementById("fragmentshader").textContent,
      });

      //

      particles = new THREE.Points(geometry, material);
      particles.position.setY(-300);
      scene.add(particles);
    }

    // 初始化光源
    function initPoint() {
      // 创建环境光
      let light = new THREE.AmbientLight(0xffffff); // soft white light
      scene.add(light);
      // 创建白色光源
      point = new THREE.SpotLight(0xffffff);
      // 设置光源位置
      point.position.set(0, 600, 200);
      // 开启阴影
      point.castShadow = true;
      // 设置阴影像素
      point.shadow.mapSize.width = 1024;
      point.shadow.mapSize.height = 1024;

      // point.shadow.camera.near = 500;
      // point.shadow.camera.far = 4000;
      // point.shadow.camera.fov = 30;

      point.intensity = 10;

      // 将光源添加到场景中
      scene.add(point);

      pointLight = new THREE.PointLight(0xffffff, 2);
      pointLight.castShadow = true;
      scene.add(pointLight);

      // light representation

      let sphere = new THREE.SphereBufferGeometry(30, 16, 8);

      let mesh = new THREE.Mesh(
        sphere,
        new THREE.MeshLambertMaterial({ color: 0xffffff })
      );
      mesh.scale.set(0.05, 0.05, 0.05);
      pointLight.add(mesh);
    }

    // 加载垃圾桶模型（GLTF格式）
    // 绿色
    function loadTrashCan1(gltf, cubeMaterial1) {
      // 定义变量接收模型
      let model = gltf.scene;
      // 模型开启阴影
      model.castShadow = true;
      // 模型接收阴影
      model.receiveShadow = true;
      // 模型以Y轴旋转180°
      model.rotation.y = Math.PI / 2;
      model.scale.x = model.scale.y = model.scale.z = 1.5;
      model.position.y = -100;
      model.position.x = -150;
      // 获取每一个mesh
      model.traverse((child) => {
        if (child.isMesh) {
          child.name = "可回收垃圾";
        }
      });

      scene.add(model);
    }

    // 黑色
    function loadTrashCan2(gltf, cubeMaterial1) {
      // 定义变量接收模型
      let model = gltf.scene;
      // 模型开启阴影
      model.castShadow = true;
      // 模型接收阴影
      model.receiveShadow = true;
      // 模型以Y轴旋转180°
      model.rotation.y = Math.PI / 2;
      model.scale.x = model.scale.y = model.scale.z = 1.5;
      model.position.y = -100;
      // model.position.x = 0;
      // 获取每一个mesh
      model.traverse((child) => {
        if (child.isMesh) {
          child.name = "有害垃圾";
        }
      });

      scene.add(model);
    }

    // 蓝色
    function loadTrashCan3(gltf, cubeMaterial1) {
      // 定义变量接收模型
      let model = gltf.scene;
      // 模型开启阴影
      model.castShadow = true;
      // 模型接收阴影
      model.receiveShadow = true;
      // 模型以Y轴旋转180°
      model.rotation.y = Math.PI / 2;
      model.scale.x = model.scale.y = model.scale.z = 1.5;
      model.position.y = -100;
      model.position.x = 0;
      // 获取每一个mesh
      model.traverse((child) => {
        if (child.isMesh) {
          child.name = "湿垃圾";
        }
      });

      scene.add(model);
    }

    // 灰色
    function loadTrashCan4(gltf, cubeMaterial1) {
      // 定义变量接收模型
      let model = gltf.scene;
      // 模型开启阴影
      model.castShadow = true;
      // 模型接收阴影
      model.receiveShadow = true;
      // 模型以Y轴旋转180°
      model.rotation.y = Math.PI / 2;
      model.scale.x = model.scale.y = model.scale.z = 1.5;
      model.position.y = -100;
      model.position.x = 300;
      // 获取每一个mesh
      model.traverse((child) => {
        if (child.isMesh) {
          child.name = "干垃圾";
        }
      });

      scene.add(model);
      isLoadingEnd.value = true;
    }

    //窗口变动触发的函数
    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // 鼠标移动事件(控制相机位置)
    function onDocumentMouseMove(event) {
      mouseX = event.clientX - windowHalfX - 100;
      mouseY = event.clientY - windowHalfY - 100;
    }

    // 鼠标点击模型事件(进行鼠标拾取)
    function onRaycasterClick(event) {
      INTERSECTED2 = null;

      // 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
      raycasterMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      raycasterMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // 通过摄像机和鼠标位置更新射线
      raycaster.setFromCamera(raycasterMouse, camera);

      // 计算物体和射线的焦点
      intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        if (
          INTERSECTED != intersects[0].object &&
          intersects[0].object.name !== null
        ) {
          if (isActive) return;
          isActive = true;
          if (INTERSECTED)
            INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);

          INTERSECTED = intersects[0].object;
          // 点击模型后，模型高亮设置
          INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
          INTERSECTED.material.emissive.setHex(0xff0000);

          // 显示弹出框
          isShowDetailBox.value = true;
          // 当前选中的垃圾桶类型
          currentType.value = INTERSECTED.name;
          // 获取垃圾桶颜色
          trashCanColor.value = INTERSECTED.material.emissive.setHex(
            INTERSECTED.currentHex
          );
        }
      } else {
        // 点击其他地方后，模型恢复初始化
        if (INTERSECTED)
          INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);

        INTERSECTED = null;
        isActive = false;
        trashCanColor.value = null;
      }
    }

    // 子组件 关闭弹出框的方法
    function closeDetailBox() {
      isShowDetailBox.value = false;

      // 点击关闭按钮后，模型高亮取消
      if (INTERSECTED)
        INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
      // 清空当前选中模型
      INTERSECTED = null;

      // 清空当前选中状态
      currentType.value = "";
      isActive = false;
    }

    function openDetailBox(value) {
      // 显示上拉弹出框
      isShowDetailBox.value = true;
      // 搜索期间不能点击模型
      isActive = false;
      // 给当前选中状态赋值 搜索
      currentType.value = "搜索";
      rubbishName.value = value;
    }

    // 设置省份位置
    function setRaycaster() {
      // raycaster = new THREE.Raycaster();
      tooltip = document.getElementById("tooltip");
      const onMouseMove = (event) => {
        tooltip.style.left = event.clientX - 30 + "px";
        tooltip.style.top = event.clientY - 40 + "px";
      };

      window.addEventListener("mousemove", onMouseMove, false);
    }

    // 鼠标移入模型事件(进行鼠标拾取)
    function onRaycasterMouseMove(event) {
      if (isActive) return;
      // console.log(event)
      // 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
      raycasterMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      raycasterMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // 通过摄像机和鼠标位置更新射线
      raycaster.setFromCamera(raycasterMouse, camera);

      // 计算物体和射线的焦点
      intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        if (INTERSECTED2 != intersects[0].object) {
          // if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);

          INTERSECTED2 = intersects[0].object;
        }
      } else {
        // 点击其他地方后，模型恢复初始化
        // if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);

        INTERSECTED2 = null;
      }
    }

    // 显示/隐藏省份
    function showTip() {
      // 显示省份的信息
      if (INTERSECTED2 && INTERSECTED2.name) {
        // console.log(INTERSECTED2)
        const rubbishName = INTERSECTED2.name;

        // tooltip文字内容显示模型名称
        tooltip.textContent = rubbishName;

        // 显示tooltip
        tooltip.style.visibility = "visible";
      } else {
        // 隐藏tooltip
        tooltip.style.visibility = "hidden";
      }
    }

    // 渲染
    function render() {
      if (!scene) return;
      //每次调用render()函数的时候，把上次调用render()执行两次.render()叠加的帧缓冲区数据清除
      // renderer.clear()
      const timer = -0.0002 * Date.now();
      // 鼠标移动后修改镜头位置
      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (-mouseY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      pointLight.position.x = 200 * Math.cos(timer);
      pointLight.position.z = 200 * Math.sin(timer);

      const positions = particles.geometry.attributes.position.array;
      const scales = particles.geometry.attributes.scale.array;

      let i = 0,
        j = 0;

      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          positions[i + 1] =
            Math.sin((ix + count) * 0.3) * 50 +
            Math.sin((iy + count) * 0.5) * 50;

          scales[j] =
            (Math.sin((ix + count) * 0.3) + 1) * 20 +
            (Math.sin((iy + count) * 0.5) + 1) * 20;

          i += 3;
          j++;
        }
      }

      particles.geometry.attributes.position.needsUpdate = true;
      particles.geometry.attributes.scale.needsUpdate = true;

      count += 0.1;

      renderer.render(scene, camera);
    }

    // 循环渲染-递归
    function animate() {
      render();

      //更新性能插件
      // stats.update();

      showTip();

      requestAnimationFrame(animate);
    }

    let rightButtonActiveIndex = ref(false);

    let rightButtons = [
      {
        text: "2021全国各省垃圾产量",
        path: "/provinceRanking",
      },
      {
        text: "垃圾分类小课堂",
        path: "/rubbishClass",
      },
      {
        text: "垃圾分类考试",
        path: "/examination",
      },
    ];

    function handleShowActiveClass(index) {
      rightButtonActiveIndex.value = index;
    }

    function handleHideActiveClass() {
      rightButtonActiveIndex.value = null;
    }

    let isLoadingEnd = ref(false);

    // 组件渲染完成后调用初始化和渲染函数
    onMounted(() => {
      init();
      animate();
    });

    onUnmounted(() => {
      // console.log(scene)
      scene = null;
      renderer = null;
      // render(null, document.getElementsByClassName('home-page')[0]);
      // console.log(document.getElementById('home-page'));
    });

    return {
      isShowDetailBox,
      currentType,
      closeDetailBox,
      openDetailBox,
      tooltip,
      trashCanColor,
      rubbishName,
      handleShowActiveClass,
      handleHideActiveClass,
      rightButtonActiveIndex,
      rightButtons,
      isLoadingEnd,
    };
  },
};
</script>

<style scoped lang="less">
.home-page {
  position: relative;
  /*height: 100%;*/
  width: 100%;
  overflow: hidden;

  /*垃圾详情*/

  .rubbish-detail {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 1);
    /*opacity: .8;*/

    /*padding-top: 60px;*/
    overflow: hidden;
    z-index: 2;
  }

  .detail-box-enter-active,
  .detail-box-leave-active {
    transition: all 1s ease;
  }

  .detail-box-enter-from {
    top: 1000px;
  }

  .detail-box-enter-to {
    top: 0;
  }

  .detail-box-leave-from {
    top: 0px;
  }

  .detail-box-leave-to {
    top: 1000px;
  }

  #tooltip {
    position: absolute;
    z-index: 2;
    background: white;
    padding: 10px;
    border-radius: 2px;
    visibility: hidden;
    user-select: none;
  }

  .search {
    position: absolute;
    right: 300px;
    top: 20px;
  }
}
</style>