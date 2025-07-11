import Layout from "@theme/Layout";
import styles from "./index.module.css";
import { useEffect, useState } from "react";

interface AnimatedIcon {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  size: number;
}

//按字母顺序排列
const frontendIcons = [
  { name: "angular", color: "#dd0031" },
  { name: "axios", color: "#5a29e4" },
  { name: "babel", color: "#f9dc3e" },
  { name: "css3", color: "#1572b6" },
  { name: "electron", color: "#47848f" },
  { name: "esbuild", color: "#ffcf00" },
  { name: "eslint", color: "#4b32c3" },
  { name: "firefox", color: "#ff7139" },
  { name: "git", color: "#f05032" },
  { name: "googlechrome", color: "#4285f4" },
  { name: "html5", color: "#e34f26" },
  { name: "javascript", color: "#f7df1e" },
  { name: "less", color: "#1d365d" },
  { name: "nextdotjs", color: "#000000" },
  { name: "nodedotjs", color: "#339933" },
  { name: "npm", color: "#cb3837" },
  { name: "nuxtdotjs", color: "#00dc82" },
  { name: "pnpm", color: "#f69220" },
  { name: "postcss", color: "#dd3a0a" },
  { name: "prettier", color: "#f7b93e" },
  { name: "react", color: "#61dafb" },
  { name: "reactrouter", color: "#ca4245" },
  { name: "rollupdotjs", color: "#ec4a3f" },
  { name: "safari", color: "#006cff" },
  { name: "sass", color: "#cc6699" },
  { name: "solid", color: "#2c4f7c" },
  { name: "svelte", color: "#ff3e00" },
  { name: "tailwindcss", color: "#06b6d4" },
  { name: "typescript", color: "#3178c6" },
  { name: "vite", color: "#646cff" },
  { name: "vuedotjs", color: "#4fc08d" },
  { name: "webpack", color: "#8dd6f9" },
  { name: "yarn", color: "#2c8ebb" },
];

export default function Home(): React.ReactNode {
  const [icons, setIcons] = useState<AnimatedIcon[]>([]);

  useEffect(() => {
    const createIcon = (): AnimatedIcon => {
      const iconData =
        frontendIcons[Math.floor(Math.random() * frontendIcons.length)];
      const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
      const size = Math.random() * 30 + 60;
      const speed = Math.random() * 2 + 1; // 1-3px per frame

      let startX, startY, targetX, targetY;

      switch (side) {
        case 0: // top
          startX = Math.random() * window.innerWidth;
          startY = -size;
          targetX = Math.random() * window.innerWidth;
          targetY = window.innerHeight + size;
          break;
        case 1: // right
          startX = window.innerWidth + size;
          startY = Math.random() * window.innerHeight;
          targetX = -size;
          targetY = Math.random() * window.innerHeight;
          break;
        case 2: // bottom
          startX = Math.random() * window.innerWidth;
          startY = window.innerHeight + size;
          targetX = Math.random() * window.innerWidth;
          targetY = -size;
          break;
        case 3: // left
          startX = -size;
          startY = Math.random() * window.innerHeight;
          targetX = window.innerWidth + size;
          targetY = Math.random() * window.innerHeight;
          break;
      }

      return {
        id: Math.random().toString(36).substring(2, 11),
        name: iconData.name,
        color: iconData.color,
        x: startX,
        y: startY,
        targetX,
        targetY,
        speed,
        size,
      };
    };

    const animateIcons = () => {
      setIcons((prevIcons) => {
        const updatedIcons = prevIcons
          .map((icon) => {
            const dx = icon.targetX - icon.x;
            const dy = icon.targetY - icon.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < icon.speed) {
              return null;
            }

            const moveX = (dx / distance) * icon.speed;
            const moveY = (dy / distance) * icon.speed;

            return {
              ...icon,
              x: icon.x + moveX,
              y: icon.y + moveY,
            };
          })
          .filter(Boolean) as AnimatedIcon[];

        if (Math.random() < 0.015 && updatedIcons.length < 18) {
          updatedIcons.push(createIcon());
        }

        return updatedIcons;
      });
    };

    let animationFrameId: number;

    const animate = () => {
      animateIcons();
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const initialIcons = Array.from({ length: 6 }, createIcon);
    setIcons(initialIcons);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <Layout title="首页" description="LTLYLFUN">
      <div className={styles.container}>
        <div className={styles.iconContainer}>
          {icons.map((icon) => (
            <img
              key={icon.id}
              src={`https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/${icon.name}.svg`}
              alt={icon.name}
              className={styles.floatingIcon}
              style={{
                left: `${icon.x}px`,
                top: `${icon.y}px`,
                width: `${icon.size}px`,
                height: `${icon.size}px`,
                filter: `drop-shadow(0 0 10px ${icon.color})`,
              }}
            />
          ))}
        </div>
        <div className={styles.textContainer}>
          <h1 className={styles.title}>LTLYLFUN</h1>
          <iframe src="https://count.getloli.com/@blog-ltlyl?name=blog-ltlyl&theme=rule34&padding=7&offset=0&align=top&scale=1&pixelated=1&darkmode=auto"></iframe>
        </div>
      </div>
    </Layout>
  );
}
