import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ShaderBackground({ theme }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Define colors for each theme
    // Blue theme
    const blueLight1 = new THREE.Color("#dbeafe"); // light blue
    const blueLight2 = new THREE.Color("#eff6ff"); // soft blue background
    const blueDark1 = new THREE.Color("#0f172a");  // dark slate
    const blueDark2 = new THREE.Color("#1e293b");  // slate accent

    // Teal (WhatsApp Web) theme
    const tealLight1 = new THREE.Color("#b9f2d9"); // soft green
    const tealLight2 = new THREE.Color("#eef6f5"); // very soft teal background
    const tealDark1 = new THREE.Color("#020809");  // deep dark green
    const tealDark2 = new THREE.Color("#0b1718");  // dark teal base

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Initial colors based on current theme
    const initialColors = getThemeColors(theme);

    const uniforms = {
      u_time: { value: 0 },
      u_res: { value: new THREE.Vector2(1, 1) },
      u_color1: { value: initialColors.color1 },
      u_color2: { value: initialColors.color2 },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec2 u_res;
        uniform float u_time;
        uniform vec3 u_color1;
        uniform vec3 u_color2;

        float wave(vec2 p, float t) {
          return sin((p.x + p.y + t) * 1.8) + sin((p.x * 1.5 - p.y * 1.1 - t) * 2.5);
        }

        void main() {
          vec2 st = gl_FragCoord.xy / u_res;
          vec2 p = st * 2.0 - 1.0;
          float t = u_time * 0.04;
          float v = wave(p, t) * 0.15 + 0.5;
          vec3 col = mix(u_color1, u_color2, v);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    canvas.__threeUniforms = uniforms;

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      uniforms.u_res.value.set(w, h);
    }
    resize();
    window.addEventListener("resize", resize);

    let animationId = null;
    function animate(t) {
      uniforms.u_time.value = t * 0.001;
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    }
    animationId = requestAnimationFrame(animate);

    function getThemeColors(currentTheme) {
      if (currentTheme === "green") {
        return { color1: tealLight1, color2: tealLight2 };
      } else if (currentTheme === "green-dark") {
        return { color1: tealDark1, color2: tealDark2 };
      } else if (currentTheme === "red") {
        return { color1: new THREE.Color("#fee2e2"), color2: new THREE.Color("#fef7f7") };
      } else if (currentTheme === "red-dark") {
        return { color1: new THREE.Color("#7f1d1d"), color2: new THREE.Color("#1a0b0b") };
      } else if (currentTheme === "dark") {
        return { color1: blueDark1, color2: blueDark2 };
      } else {
        // default light blue
        return { color1: blueLight1, color2: blueLight2 };
      }
    }

    // Clean up
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  // Update uniforms when theme changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // We can directly update the uniform values here
    const tealLight1 = new THREE.Color("#b9f2d9");
    const tealLight2 = new THREE.Color("#eef6f5");
    const tealDark1 = new THREE.Color("#020809");
    const tealDark2 = new THREE.Color("#0b1718");
    const blueLight1 = new THREE.Color("#dbeafe");
    const blueLight2 = new THREE.Color("#eff6ff");
    const blueDark1 = new THREE.Color("#0f172a");
    const blueDark2 = new THREE.Color("#1e293b");
    const redLight1 = new THREE.Color("#fee2e2");
    const redLight2 = new THREE.Color("#fef7f7");
    const redDark1 = new THREE.Color("#7f1d1d");
    const redDark2 = new THREE.Color("#1a0b0b");

    let c1, c2;
    if (theme === "green") {
      c1 = tealLight1;
      c2 = tealLight2;
    } else if (theme === "green-dark") {
      c1 = tealDark1;
      c2 = tealDark2;
    } else if (theme === "red") {
      c1 = redLight1;
      c2 = redLight2;
    } else if (theme === "red-dark") {
      c1 = redDark1;
      c2 = redDark2;
    } else if (theme === "dark") {
      c1 = blueDark1;
      c2 = blueDark2;
    } else {
      c1 = blueLight1;
      c2 = blueLight2;
    }

    // Smooth transition
    // In a real application, you could animate these. Direct setting works great too!
    if (canvas.__threeUniforms) {
      canvas.__threeUniforms.u_color1.value = c1;
      canvas.__threeUniforms.u_color2.value = c2;
    }
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      id="bg"
      className="fixed inset-0 w-full h-full z-0 pointer-events-none"
    />
  );
}
