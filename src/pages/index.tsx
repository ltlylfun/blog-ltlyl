import React, { useEffect, useRef } from "react";
import Layout from "@theme/Layout";
import styles from "./index.module.css";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import BrowserOnly from "@docusaurus/BrowserOnly";
// 预先导入GSAP，而不是动态导入
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// 注册ScrollTrigger插件
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// 创建着色器代码作为字符串常量
const vertShader = `
  precision mediump float;

  varying vec2 vUv;
  attribute vec2 a_position;

  void main() {
      vUv = a_position;
      gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragShader = `
  precision mediump float;

  varying vec2 vUv;
  uniform vec2 u_resolution;
  uniform float u_scroll_progr;
  uniform float u_col_width;
  uniform float u_seed;
  uniform float u_scale;
  uniform float u_time;
  uniform float u_speed;
  uniform float u_opacity;
  uniform vec3 u_color;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
      m = m*m;
      m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
  }

  float get_l(vec2 v) {
      return 1. - clamp(0., 1., length(v));
  }

  float rand(float n) {
      return fract(sin(n) * 43758.5453123);
  }

  void main() {
      float scale = .001 * u_scale;
      float speed = .001 * u_speed;

      vec2 uv = vUv;
      uv.x *= (scale * u_resolution.x);

      vec2 noise_uv = uv;
      noise_uv *= 5.;
      noise_uv.y *= (.25 * scale * u_resolution.y);
      noise_uv += vec2(0., u_time * 1.5 * speed);
      float shape = 0.;
      shape += snoise(noise_uv);
      shape = clamp(.5 + .5 * shape, 0., 1.);
      shape *= pow(.5 * uv.y + .7 + pow(u_scroll_progr, 2.) + (.4 * u_scroll_progr * (1. - pow(vUv.x - .2, 2.))), 10.);
      shape = clamp(shape, 0., 1.);

      float dots = 0.;
      float bars = 0.;
      float light = 0.;

      const int num_col = 9;
      for (int i = 0; i < num_col; i++) {

          vec2 col_uv = vUv;

          float start_time_offset = rand(100. * (float(i) + u_seed));
          float c_t = fract(u_time * speed + start_time_offset);
          float drop_time = .2 + .6 * rand(10. * (float(i) + u_seed));

          float before_drop_normal = c_t / drop_time;
          float before_drop_t = pow(before_drop_normal, .4) * drop_time;
          float after_drop_normal = max(0., c_t - drop_time) / (1. - drop_time);
          float after_drop_t_dot = 3. * pow(after_drop_normal, 2.) * (1. - drop_time);
          float after_drop_t_bar = pow(after_drop_normal, 2.) * (drop_time);

          float eased_drop_t = step(c_t, drop_time) * before_drop_t;
          eased_drop_t += step(drop_time, c_t) * (drop_time + after_drop_t_dot);

          col_uv.y += (1. + 3. * rand(15. * float(i))) * u_scroll_progr;

          col_uv.x *= (u_resolution.x / u_resolution.y);
          col_uv *= (7. * scale * u_resolution.y);

          col_uv.x += (u_col_width * (.5 * float(num_col) - float(i)));

          vec2 dot_uv = col_uv;
          dot_uv.y += 4. * (eased_drop_t - .5);

          float dot = get_l(dot_uv);
          dot = pow(dot, 4.);

          float drop_grow = step(c_t, drop_time) * pow(before_drop_normal, .4);
          drop_grow += step(drop_time, c_t) * mix(1., .8, clamp(7. * after_drop_normal, 0., 1.));
          dot *= drop_grow;

          dot *= step(.5, drop_time);
          dots += dot;

          vec2 bar_uv = col_uv;
          bar_uv.y += step(c_t, drop_time) * 4. * (before_drop_t - .5);
          bar_uv.y += step(drop_time, c_t) * 4. * (drop_time - after_drop_t_bar - .5);

          float bar = smoothstep(-.5, 0., bar_uv.x) * (1. - smoothstep(0., .5, bar_uv.x));
          bar = pow(bar, 4.);
          light += bar * smoothstep(.0, .1, -bar_uv.x);
          float bar_mask = smoothstep(-.2, .2, bar_uv.y);
          bar *= bar_mask;

          bars += bar;
      }

      shape += bars;
      shape = clamp(shape, 0., 1.);
      shape += dots;

      float gooey = smoothstep(.48, .5, shape);
      gooey -= .1 * smoothstep(.5, .6, shape);
      vec3 color = u_color;
      color.r += .2 * (1. - vUv.y) * (1. - u_scroll_progr);
      color *= gooey;
      color = mix(color, vec3(1.), max(0., 1. - 2. * vUv.y) * light * smoothstep(.1, .7, snoise(.5 * uv)) * (smoothstep(.49, .6, shape) - smoothstep(.6, 1., shape)));

      gl_FragColor = vec4(color, gooey);
  }
`;

function CanvasAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollMsgRef = useRef<HTMLDivElement>(null);
  const scrollArrowRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 因为需要使用浏览器API，我们需要确保这段代码只在客户端执行
    if (typeof window !== "undefined" && canvasRef.current) {
      try {
        const devicePixelRatio = Math.min(window.devicePixelRatio, 2);

        const params = {
          scrollProgress: 0,
          colWidth: 0.7,
          speed: 0.2,
          scale: 0.25,
          seed: 0.231,
          color: [0.235, 0.635, 0.062],
        };

        const canvasEl = canvasRef.current;
        const contentEl = contentRef.current;
        const scrollMsgEl = scrollMsgRef.current;
        const scrollArrowEl = scrollArrowRef.current;
        const pageEl = pageRef.current;

        if (
          !canvasEl ||
          !contentEl ||
          !scrollMsgEl ||
          !scrollArrowEl ||
          !pageEl
        ) {
          return;
        }

        // 初始化着色器
        const gl = (canvasEl.getContext("webgl") ||
          canvasEl.getContext("experimental-webgl")) as WebGLRenderingContext;

        // 检查WebGL上下文是否成功创建
        if (!gl) {
          console.error("WebGL is not supported by your browser.");
          return;
        }

        // 创建着色器函数
        function createShader(
          gl: WebGLRenderingContext,
          sourceCode: string,
          type: number
        ) {
          const shader = gl.createShader(type);
          if (!shader) {
            console.error("Unable to create shader");
            return null;
          }
          gl.shaderSource(shader, sourceCode);
          gl.compileShader(shader);

          if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(
              "An error occurred compiling the shaders: " +
                gl.getShaderInfoLog(shader)
            );
            gl.deleteShader(shader);
            return null;
          }

          return shader;
        }

        // 创建着色器程序
        const vertexShader = createShader(gl, vertShader, gl.VERTEX_SHADER);
        const fragmentShader = createShader(gl, fragShader, gl.FRAGMENT_SHADER);

        if (!vertexShader || !fragmentShader) {
          console.error("Failed to create shaders");
          return;
        }

        function createShaderProgram(
          gl: WebGLRenderingContext,
          vertexShader: WebGLShader,
          fragmentShader: WebGLShader
        ) {
          const program = gl.createProgram();
          if (!program) {
            console.error("Unable to create shader program");
            return null;
          }
          gl.attachShader(program, vertexShader);
          gl.attachShader(program, fragmentShader);
          gl.linkProgram(program);

          if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error(
              "Unable to initialize the shader program: " +
                gl.getProgramInfoLog(program)
            );
            return null;
          }

          return program;
        }

        const shaderProgram = createShaderProgram(
          gl,
          vertexShader,
          fragmentShader
        );

        if (!shaderProgram) {
          console.error("Failed to create shader program");
          return;
        }

        // 获取统一变量的位置
        function getUniforms(program: WebGLProgram) {
          let uniforms: { [key: string]: WebGLUniformLocation | null } = {};
          let uniformCount = gl.getProgramParameter(
            program,
            gl.ACTIVE_UNIFORMS
          );
          for (let i = 0; i < uniformCount; i++) {
            const activeUniform = gl.getActiveUniform(program, i);
            if (activeUniform) {
              let uniformName = activeUniform.name;
              uniforms[uniformName] = gl.getUniformLocation(
                program,
                uniformName
              );
            }
          }
          return uniforms;
        }

        const uniforms = getUniforms(shaderProgram);

        // 设置顶点数据
        const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        gl.useProgram(shaderProgram);

        const positionLocation = gl.getAttribLocation(
          shaderProgram,
          "a_position"
        );
        gl.enableVertexAttribArray(positionLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.uniform1f(uniforms.u_col_width, params.colWidth);
        gl.uniform1f(uniforms.u_speed, params.speed);
        gl.uniform1f(uniforms.u_scale, params.scale);
        gl.uniform1f(uniforms.u_seed, params.seed);
        gl.uniform3f(
          uniforms.u_color,
          params.color[0],
          params.color[1],
          params.color[2]
        );

        // 调整画布大小的函数
        function resizeCanvas() {
          if (canvasEl) {
            canvasEl.width = window.innerWidth * devicePixelRatio;
            canvasEl.height = window.innerHeight * devicePixelRatio;
            gl.viewport(0, 0, canvasEl.width, canvasEl.height);
            gl.uniform2f(
              uniforms.u_resolution,
              canvasEl.width,
              canvasEl.height
            );
          }
        }

        // 渲染函数
        function render() {
          const currentTime = performance.now();
          gl.uniform1f(uniforms.u_time, currentTime);
          gl.uniform1f(uniforms.u_scroll_progr, params.scrollProgress);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

          requestAnimationFrame(render);
        }

        // 设置滚动触发器
        const st = gsap
          .timeline({
            scrollTrigger: {
              trigger: pageEl,
              start: "0% 0%",
              end: "100% 100%",
              scrub: true,
            },
          })
          .to(params, { scrollProgress: 1 }, 0)
          .to(scrollArrowEl, { duration: 0.2, y: 50, opacity: 0 }, 0)
          .to(scrollMsgEl, { opacity: 0 }, 0)
          .to(contentEl, { duration: 0.3, opacity: 1 }, 0.5)
          .progress(0);

        // 添加窗口调整大小事件监听器
        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();
        render();

        // 设置页面可见
        gsap.set(pageEl, { opacity: 1 });
      } catch (error) {
        console.error("Failed to load animation:", error);
      }

      // 组件卸载时的清理
      return () => {
        window.removeEventListener("resize", () => {});
      };
    }
  }, []);

  return (
    <>
      <div ref={pageRef} className={styles.page}>
        <div ref={scrollMsgRef} className={styles.scrollMsg}>
          <div>Hello 👋</div>
          <div>scroll me</div>
          <div ref={scrollArrowRef} className={styles.arrowAnimated}>
            &darr;
          </div>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        id="gooeyOverlay"
        className={styles.gooeyOverlay}
      ></canvas>
      <div ref={contentRef} className={styles.textOverlay}>
        <p>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            linkedIn
          </a>{" "}
          |{" "}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>{" "}
          |{" "}
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Twitter
          </a>
        </p>
      </div>
    </>
  );
}

export default function Home(): React.ReactNode {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title={siteConfig.title}
      description="Description will go into a meta tag in <head />"
    >
      <BrowserOnly>{() => <CanvasAnimation />}</BrowserOnly>
    </Layout>
  );
}
