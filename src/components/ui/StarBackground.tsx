"use client";

import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { type Container, type ISourceOptions } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

export const StarBackground = () => {
  const [init, setInit] = useState(false);

  // This runs once to load the slim engine into memory
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    // Optional: Do something when particles are loaded
  };

  // --- THE STAR CONFIGURATION ---
  const options: ISourceOptions = {
    // Base background color (deep space black)
    background: {
      color: {
        value: "#050505", 
      },
    },
    // Ensures it covers the whole screen behind everything
    fullScreen: {
      enable: true,
      zIndex: -1,
    },
    fpsLimit: 120,
    interactivity: {
      events: {
        // Optional: subtle reaction to mouse hover
        onHover: {
          enable: true,
          mode: "bubble", 
        },
        resize: { enable: true },
      },
      modes: {
        bubble: {
          distance: 200,
          duration: 2,
          size: 0, // Makes them slightly disappear on hover for depth
          opacity: 0,
        },
      },
    },
    particles: {
      color: {
        value: "#ffffff",
      },
      // The "sprinkler" movement
      move: {
        direction: "none", // Move in random directions
        enable: true,
        outModes: {
          default: "out", // When they leave screen, reappear on other side
        },
        random: true,
        speed: 1.3, // Very slow, gentle drifting
        straight: false,
      },
      number: {
        density: {
          enable: true,
          // width: 1920, height: 1080 based density
        },
        value: 150, // How many stars
      },
      // Twinkling effect animation
      opacity: {
        value: { min: 0.1, max: 1 }, // Vary opacity between 10% and 100%
        animation: {
          enable: true,
          speed: 1, // Twinkle speed
          sync: false,
        },
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 0.5, max: 2 }, // Vary star sizes
      },
    },
    detectRetina: true,
  };

  if (init) {
    return (
      <Particles
        id="tsparticles"
        particlesLoaded={particlesLoaded}
        options={options}
      />
    );
  }

  return null;
};