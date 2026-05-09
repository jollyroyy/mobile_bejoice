'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { SparklesCore } from './ui/sparkles'
import { useLang } from '@/context/LangContext'
import ar from '@/i18n/ar'

const OFFICES = [
  // HQ — Dubai, UAE
  { name: 'Dubai HQ',        city: 'Dubai',    country: 'UAE',   lat: 25.2048, lng: 55.2708, type: 'hq'      },
  // KSA offices
  { name: 'Riyadh Office',   city: 'Riyadh',   country: 'KSA',   lat: 24.7136, lng: 46.6753, type: 'office'  },
  { name: 'Jeddah Office',   city: 'Jeddah',   country: 'KSA',   lat: 21.4858, lng: 39.1925, type: 'office'  },
  { name: 'Dammam Office',   city: 'Dammam',   country: 'KSA',   lat: 26.4207, lng: 50.0888, type: 'office'  },
  // Partner offices
  { name: 'Mumbai Partner',  city: 'Mumbai',   country: 'India', lat: 19.0760, lng: 72.8777, type: 'partner' },
  { name: 'Shanghai Partner',city: 'Shanghai', country: 'China', lat: 31.2304, lng: 121.4737,type: 'partner' },
];

// Country region highlights — center lat/lng + approximate radius on the globe
const COUNTRIES = [
  { name: 'UAE',   lat: 24.0,  lng: 54.5,  radius: 0.04, color: 0xffe680, type: 'hq'      },
  { name: 'KSA',   lat: 24.0,  lng: 44.5,  radius: 0.12, color: 0x5BC2E7, type: 'office'  },
  { name: 'India', lat: 22.0,  lng: 78.5,  radius: 0.14, color: 0x5ec4d4, type: 'partner' },
  { name: 'China', lat: 35.0,  lng: 105.0, radius: 0.18, color: 0x5ec4d4, type: 'partner' },
];

function latLngToVec3(lat, lng, r = 1) {
  const phi   = (90 - lat)  * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta),
  );
}

// Radial gradient shader for country region glow discs
const REGION_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`;
const REGION_FRAG = `
  uniform vec3 glowColor;
  uniform float opacity;
  varying vec2 vUv;
  void main() {
    float d = distance(vUv, vec2(0.5));
    float alpha = smoothstep(0.5, 0.08, d) * opacity;
    gl_FragColor = vec4(glowColor, alpha);
  }`;

const ATM_VERT = `
  varying vec3 vNormal; varying vec3 vPosition;
  void main() {
    vNormal   = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position,1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }`;
const ATM_FRAG = `
  uniform vec3  glowColor;
  uniform float coeff;
  uniform float power;
  varying vec3 vNormal; varying vec3 vPosition;
  void main() {
    vec3  vNN  = normalize(vNormal);
    vec3  view = normalize(-vPosition);
    float rim  = pow(coeff * (1.0 - dot(vNN, view)), power);
    gl_FragColor = vec4(glowColor, rim);
  }`;

export default function BejoiceGlobe({ embedded = false, fullscreen = false }) {
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const mountRef   = useRef(null);
  const isDragging = useRef(false);
  const prevMouse  = useRef({ x: 0, y: 0 });
  const autoSpin   = useRef(true);
  const spinTO     = useRef(null);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const W  = el.clientWidth;
    const H  = el.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: window.innerWidth > 768, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth > 768 ? 2 : 1.5));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    // Tone mapping can be heavy on mobile
    if (window.innerWidth > 768) {
      renderer.toneMapping         = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.6;
    }
    el.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, W / H, 0.1, 200);
    camera.position.set(0, 0.15, 2.55);
    camera.lookAt(0, 0, 0);

    const group = new THREE.Group();
    group.rotation.y = 2.374;
    group.rotation.x = 0.18;
    scene.add(group);

    // Circular sprite texture for round Points
    const makeCircleTex = () => {
      const c = document.createElement('canvas'); c.width = 32; c.height = 32;
      const ctx = c.getContext('2d');
      const g = ctx.createRadialGradient(16,16,0,16,16,16);
      g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(1,'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(16,16,16,0,Math.PI*2); ctx.fill();
      const tex = new THREE.CanvasTexture(c);
      return tex;
    };
    const circleTex = makeCircleTex();

    // Star field
    const addStars = (count, minR, maxR, size, opacity) => {
      const verts = [];
      for (let i = 0; i < count; i++) {
        const t   = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r   = minR + Math.random() * (maxR - minR);
        verts.push(r*Math.sin(phi)*Math.cos(t), r*Math.sin(phi)*Math.sin(t), r*Math.cos(phi));
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
      scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
        color: 0xffffff, size, transparent: true, opacity, sizeAttenuation: true,
      })));
    };
    const starCount = window.innerWidth > 768 ? 4000 : 800;
    const secondaryStars = window.innerWidth > 768 ? 2000 : 400;
    addStars(starCount, 65, 90, 0.18, 0.9);
    addStars(secondaryStars, 60, 70, 0.08, 0.55);

    // Earth
    const loader   = new THREE.TextureLoader();
    const segs     = window.innerWidth > 768 ? 128 : 64;
    const earthGeo = new THREE.SphereGeometry(1, segs, segs);
    const earthMat = new THREE.MeshPhongMaterial({
      color:     new THREE.Color(0x060d18),
      specular:  new THREE.Color(0x1a3a5c),
      shininess: 28,
      emissive:  new THREE.Color(0xffeedd),
      emissiveIntensity: 0,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    group.add(earthMesh);

    loader.load(
      'https://cdn.jsdelivr.net/npm/three-globe@2.31.2/example/img/earth-night.jpg',
      (nightTex) => {
        nightTex.colorSpace        = THREE.SRGBColorSpace;
        earthMat.map               = nightTex;
        earthMat.color             = new THREE.Color(0xffffff);
        earthMat.emissiveMap       = nightTex;
        earthMat.emissive          = new THREE.Color(0xffe8cc);
        earthMat.emissiveIntensity = 1.6;
        earthMat.needsUpdate       = true;
      },
    );

    // Atmosphere
    const atmSegs = window.innerWidth > 768 ? 64 : 32;
    const makeAtm = (color, coeff, power, side, size) => new THREE.Mesh(
      new THREE.SphereGeometry(size, atmSegs, atmSegs),
      new THREE.ShaderMaterial({
        uniforms: {
          glowColor: { value: new THREE.Color(color) },
          coeff:     { value: coeff },
          power:     { value: power },
        },
        vertexShader: ATM_VERT, fragmentShader: ATM_FRAG,
        transparent: true, side,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
    );
    group.add(makeAtm(0x4488dd, 0.55, 5.5, THREE.FrontSide, 1.025));
    group.add(makeAtm(0x22aaff, 0.40, 4.0, THREE.FrontSide, 1.06));
    group.add(makeAtm(0x113366, 0.60, 3.0, THREE.BackSide,  1.28));

    // Office markers
    const markerGroup = new THREE.Group();
    group.add(markerGroup);
    const dotObjects  = [];

    const pulseRings = [];
    OFFICES.forEach(o => {
      const pos = latLngToVec3(o.lat, o.lng, 1.022);

      const isHQ = o.type === 'hq';
      const isPartner = o.type === 'partner';
      const dotColor = isHQ ? 0xffe680 : isPartner ? 0x5ec4d4 : 0x5BC2E7;
      const dotSize = isHQ ? 0.018 : 0.012;

      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(dotSize, 16, 16),
        new THREE.MeshBasicMaterial({ color: dotColor }),
      );
      dot.position.copy(pos);
      dot.userData = { office: o.name, type: o.type, country: o.country };
      markerGroup.add(dot);
      dotObjects.push(dot);

      // HQ gets a subtle pulsing ring
      if (isHQ) {
        const ringGeo = new THREE.RingGeometry(0.028, 0.035, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xffe680, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(pos);
        ring.lookAt(pos.clone().multiplyScalar(2));
        markerGroup.add(ring);
        pulseRings.push(ring);
      }

      // Partner offices get a small outer ring
      if (isPartner) {
        const ringGeo = new THREE.RingGeometry(0.02, 0.025, 24);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x5ec4d4, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(pos);
        ring.lookAt(pos.clone().multiplyScalar(2));
        markerGroup.add(ring);
      }
    });

    // Country region glows — soft discs on globe surface
    COUNTRIES.forEach(c => {
      const pos = latLngToVec3(c.lat, c.lng, 1.005);
      const geo = new THREE.CircleGeometry(c.radius, 48);
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          glowColor: { value: new THREE.Color(c.color) },
          opacity: { value: c.type === 'hq' ? 0.35 : 0.2 },
        },
        vertexShader: REGION_VERT,
        fragmentShader: REGION_FRAG,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const disc = new THREE.Mesh(geo, mat);
      disc.position.copy(pos);
      disc.lookAt(pos.clone().multiplyScalar(2));
      group.add(disc);
    });

    // Connection arcs from HQ to all other offices
    const hqPos = latLngToVec3(OFFICES[0].lat, OFFICES[0].lng, 1.0);
    const arcMeshes = [];
    OFFICES.slice(1).forEach(o => {
      const destPos = latLngToVec3(o.lat, o.lng, 1.0);
      // Great circle arc via midpoint lifted above the surface
      const mid = hqPos.clone().add(destPos).multiplyScalar(0.5);
      const dist = hqPos.distanceTo(destPos);
      const lift = 1.0 + dist * 0.35;
      mid.normalize().multiplyScalar(lift);

      const curve = new THREE.QuadraticBezierCurve3(hqPos.clone(), mid, destPos.clone());
      const pts = curve.getPoints(48);
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const isPartner = o.type === 'partner';
      const mat = new THREE.LineBasicMaterial({
        color: isPartner ? 0x5ec4d4 : 0xc8a84e,
        transparent: true,
        opacity: 0.28,
        linewidth: 1,
      });
      const arc = new THREE.Line(geo, mat);
      group.add(arc);
      arcMeshes.push(arc);
    });

    // ── Triangulated polygon network (reference image style) ──────────
    const networkGroup = new THREE.Group();
    group.add(networkGroup);

    // Port anchor nodes — major world ports (become bright glowing dots)
    const PORT_NODES = [
      { lat: 21.5,  lng: 39.2,   r: 1.02, port: true  }, // Jeddah — KSA main hub
      { lat: 25.2,  lng: 55.3,   r: 1.02, port: true  }, // Dubai
      { lat: 30.0,  lng: 31.2,   r: 1.02, port: true  }, // Port Said
      { lat: 37.9,  lng: 23.7,   r: 1.03, port: true  }, // Piraeus
      { lat: 51.9,  lng:  4.5,   r: 1.04, port: true  }, // Rotterdam
      { lat: 53.5,  lng:  9.9,   r: 1.04, port: true  }, // Hamburg
      { lat: 11.6,  lng: 43.1,   r: 1.02, port: true  }, // Djibouti
      { lat: 19.1,  lng: 72.9,   r: 1.03, port: true  }, // Mumbai
      { lat:  1.3,  lng: 103.8,  r: 1.03, port: true  }, // Singapore
      { lat: 22.3,  lng: 114.2,  r: 1.03, port: true  }, // Hong Kong
      { lat: 31.2,  lng: 121.5,  r: 1.03, port: true  }, // Shanghai
      { lat: 35.7,  lng: 139.7,  r: 1.04, port: true  }, // Tokyo
      { lat: 37.5,  lng: 126.9,  r: 1.04, port: true  }, // Busan
      { lat: -33.9, lng: 151.2,  r: 1.04, port: true  }, // Sydney
      { lat: 40.7,  lng: -74.0,  r: 1.04, port: true  }, // New York
      { lat: 34.0,  lng: -118.2, r: 1.04, port: true  }, // Los Angeles
      { lat: 29.7,  lng: -95.4,  r: 1.03, port: true  }, // Houston
      { lat: -23.5, lng: -46.6,  r: 1.03, port: true  }, // Santos
      { lat: -33.9, lng: 18.4,   r: 1.03, port: true  }, // Cape Town
      { lat:  6.5,  lng:  3.4,   r: 1.02, port: true  }, // Lagos
      { lat: -4.0,  lng: 39.7,   r: 1.02, port: true  }, // Mombasa
      { lat: 55.7,  lng: 37.6,   r: 1.04, port: true  }, // Moscow
      { lat: 43.1,  lng: 131.9,  r: 1.04, port: true  }, // Vladivostok
    ];

    // Fibonacci fill nodes — dense enough to leave no gaps across the globe
    const FILL_COUNT = 72;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const fillNodes = Array.from({ length: FILL_COUNT }, (_, i) => {
      const y     = 1 - (i / (FILL_COUNT - 1)) * 2;
      const rad   = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = goldenAngle * i;
      const r     = i % 4 === 0 ? 1.09 : 1.02; // every 4th floats beyond globe
      return { vec: new THREE.Vector3(Math.cos(theta) * rad * r, y * r, Math.sin(theta) * rad * r), port: false };
    });

    // Merge all nodes
    const allNodes = [
      ...PORT_NODES.map(p => ({ vec: latLngToVec3(p.lat, p.lng, p.r), port: p.port })),
      ...fillNodes,
    ];

    // Connect every pair within threshold — no per-node cap so no broken chains
    // Distance tuned so each node gets ~4-6 neighbours on average (no isolated gaps)
    const DIST_MAX = 0.60;
    const lineVerts = [];
    for (let i = 0; i < allNodes.length; i++) {
      for (let j = i + 1; j < allNodes.length; j++) {
        const d = allNodes[i].vec.distanceTo(allNodes[j].vec);
        if (d < DIST_MAX) {
          const a = allNodes[i].vec, b = allNodes[j].vec;
          lineVerts.push(a.x, a.y, a.z, b.x, b.y, b.z);
        }
      }
    }

    const netLineGeo = new THREE.BufferGeometry();
    netLineGeo.setAttribute('position', new THREE.Float32BufferAttribute(lineVerts, 3));
    const networkLines = new THREE.LineSegments(netLineGeo, new THREE.LineBasicMaterial({
      color: 0xaaddff, transparent: true, opacity: 0.20,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    networkGroup.add(networkLines);

    // Fill node dots — small, subtle
    const fillVerts = fillNodes.map(n => [n.vec.x, n.vec.y, n.vec.z]).flat();
    const fillGeo = new THREE.BufferGeometry();
    fillGeo.setAttribute('position', new THREE.Float32BufferAttribute(fillVerts, 3));
    networkGroup.add(new THREE.Points(fillGeo, new THREE.PointsMaterial({
      color: 0xc8eeff, size: 0.020, transparent: true, opacity: 0.65,
      sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false,
      map: circleTex, alphaTest: 0.01,
    })));

    // Port dots — brighter, larger
    const portVerts = PORT_NODES.map(p => { const v = latLngToVec3(p.lat, p.lng, p.r); return [v.x, v.y, v.z]; }).flat();
    const portGeo = new THREE.BufferGeometry();
    portGeo.setAttribute('position', new THREE.Float32BufferAttribute(portVerts, 3));
    const hubDots = new THREE.Points(portGeo, new THREE.PointsMaterial({
      color: 0xffffff, size: 0.042, transparent: true, opacity: 0.95,
      sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false,
      map: circleTex, alphaTest: 0.01,
    }));
    networkGroup.add(hubDots);

    // Jeddah — extra bright KSA anchor
    const saudiVec = latLngToVec3(21.5, 39.2, 1.02);
    const saudiGeo = new THREE.BufferGeometry();
    saudiGeo.setAttribute('position', new THREE.Float32BufferAttribute([saudiVec.x, saudiVec.y, saudiVec.z], 3));
    networkGroup.add(new THREE.Points(saudiGeo, new THREE.PointsMaterial({
      color: 0xffffff, size: 0.082, transparent: true, opacity: 1.0,
      sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false,
      map: circleTex, alphaTest: 0.01,
    })));

    // Lighting
    scene.add(new THREE.AmbientLight(0x0a1525, 0.8));
    const moon = new THREE.DirectionalLight(0xb8d8ff, 1.4);
    moon.position.set(-5, 4, 3);
    scene.add(moon);
    const fillLight = new THREE.PointLight(0x1133aa, 0.8, 6);
    fillLight.position.set(-1, -2, 1);
    scene.add(fillLight);

    // Raycaster — desktop hover only
    const raycaster  = new THREE.Raycaster();
    const mouse2     = new THREE.Vector2();
    const onMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      mouse2.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouse2.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse2, camera);
      const hits = raycaster.intersectObjects(dotObjects);
      if (hits.length) {
        const d = hits[0].object.userData;
        const suffix = d.type === 'hq' ? ' · HQ' : d.type === 'partner' ? ' · Partner' : '';
        setHovered(d.office + suffix);
      } else setHovered(null);
    };
    el.addEventListener('mousemove', onMouseMove);

    // Drag — mouse
    const onDown = (e) => {
      isDragging.current = true; autoSpin.current = false;
      clearTimeout(spinTO.current);
      prevMouse.current = { x: e.clientX, y: e.clientY };
    };
    const onDrag = (e) => {
      if (!isDragging.current) return;
      const dx = (e.clientX - prevMouse.current.x) * 0.005;
      const dy = (e.clientY - prevMouse.current.y) * 0.003;
      group.rotation.y += dx;
      group.rotation.x  = Math.max(-0.6, Math.min(0.6, group.rotation.x + dy));
      prevMouse.current = { x: e.clientX, y: e.clientY };
    };
    const onUp = () => {
      isDragging.current = false;
      spinTO.current = setTimeout(() => { autoSpin.current = true; }, 2200);
    };

    // Touch drag — mobile
    const onTouchStart = (e) => {
      isDragging.current = true; autoSpin.current = false;
      clearTimeout(spinTO.current);
      prevMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchMove = (e) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const dx = (e.touches[0].clientX - prevMouse.current.x) * 0.005;
      const dy = (e.touches[0].clientY - prevMouse.current.y) * 0.003;
      group.rotation.y += dx;
      group.rotation.x  = Math.max(-0.6, Math.min(0.6, group.rotation.x + dy));
      prevMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = () => {
      isDragging.current = false;
      spinTO.current = setTimeout(() => { autoSpin.current = true; }, 2200);
    };

    el.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', onUp);
    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove',  onTouchMove,  { passive: false });
    el.addEventListener('touchend',   onTouchEnd);

    // Animate
    let raf; let t = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      t  += 0.016;
      if (autoSpin.current) group.rotation.y += 0.0010;


      fillLight.intensity = 0.75 + 0.2 * Math.sin(t * 2.3 + 0.7);
      // Pulse HQ ring
      pulseRings.forEach(ring => {
        const s = 1 + 0.15 * Math.sin(t * 1.8);
        ring.scale.set(s, s, 1);
        ring.material.opacity = 0.35 + 0.25 * Math.sin(t * 1.8);
      });
      // Subtle arc breathing
      arcMeshes.forEach(arc => {
        arc.material.opacity = 0.18 + 0.12 * Math.sin(t * 1.2);
      });
      // Network pulse
      networkLines.material.opacity = 0.18 + 0.08 * Math.sin(t * 0.7);
      hubDots.material.opacity      = 0.88 + 0.12 * Math.sin(t * 1.4 + 1.0);
      renderer.render(scene, camera);
    };
    tick();

    // Resize
    const onResize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf); clearTimeout(spinTO.current);
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('mouseup', onUp);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove',  onTouchMove);
      el.removeEventListener('touchend',   onTouchEnd);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  const inner = (
      <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 'clamp(1.5rem,4vw,4rem)', padding: '0 clamp(1rem,3vw,2rem)' }}>

        {/* ── LEFT: Globe ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }} transition={{ duration: 1.2, ease: [0.16,1,0.3,1] }}
          style={{ position: 'relative', flexShrink: 0, width: 'clamp(320px, 55vw, 720px)' }}
        >
          {/* Outer glow ring */}
          <div style={{
            position: 'absolute', inset: -40,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(91,194,231,0.14) 0%, rgba(30,80,180,0.09) 55%, transparent 75%)',
            filter: 'blur(24px)',
            pointerEvents: 'none',
            zIndex: 0,
          }} />

          {/* Globe canvas */}
          <div
            ref={mountRef}
            style={{
              width: '100%',
              aspectRatio: '1 / 1',
              cursor: 'grab',
              borderRadius: '50%',
              overflow: 'hidden',
              position: 'relative',
              zIndex: 1,
              boxShadow: '0 0 0 1px rgba(91,194,231,0.12), 0 0 80px rgba(30,80,200,0.28), 0 0 160px rgba(10,20,60,0.7)',
              touchAction: 'none',
            }}
          />

          {/* Hover tooltip */}
          {hovered && (
            <motion.div
              initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
              style={{
                position:'absolute', bottom:32, left:'50%', transform:'translateX(-50%)',
                background:'rgba(6,8,20,0.95)',
                border:'1px solid rgba(91,194,231,0.55)',
                borderRadius:'2rem', padding:'0.45rem 1.3rem',
                fontFamily:"'DM Sans',sans-serif", fontSize:'0.85rem', fontWeight:700,
                color:'#5BC2E7', whiteSpace:'nowrap', pointerEvents:'none',
                boxShadow:'0 4px 24px rgba(0,0,0,0.8)',
                zIndex: 2,
              }}
            >
              {hovered}
            </motion.div>
          )}

          <div style={{ textAlign:'center', marginTop:'0.8rem', fontFamily:"'DM Sans',sans-serif", fontSize:'0.65rem', color:'rgba(91,194,231,0.4)', letterSpacing:'0.22em', textTransform:'uppercase' }}>
            DRAG TO ROTATE
          </div>
        </motion.div>

        {/* ── RIGHT: Premium Bento Location Panel ── */}
        <motion.div
          initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.8, ease: [0.16,1,0.3,1] }}
          style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'clamp(1rem,2vw,1.6rem)', alignItems: 'center', textAlign: 'center', paddingLeft: 'clamp(1rem,3vw,3rem)' }}
        >
          {/* Headline */}
          <h2 className="no-reveal" style={{
            fontFamily: isAr ? "'Cairo','Noto Sans Arabic',sans-serif" : "'Bebas Neue',sans-serif",
            fontSize:'clamp(1.8rem,4vw,3.6rem)',
            color:'#ffffff', letterSpacing: isAr ? '0' : '0.05em',
            lineHeight: isAr ? 1.3 : 0.95, margin:0,
            textShadow:'0 2px 4px rgba(0,0,0,0.9), 0 0 40px rgba(91,194,231,0.15)',
            textAlign:'center',
          }}>
            {isAr ? ar.globe.headline : <>
              <span style={{ color:'#ffffff' }}>BEJOICE CONNECTS </span><br/>
              <span style={{ color:'#5BC2E7', textShadow:'0 0 30px rgba(91,194,231,0.4)' }}>SAUDI TO THE WORLD</span>
            </>}
          </h2>

          {/* ── Bento Grid ── */}
          <div style={{
            display:'grid',
            gridTemplateColumns:'1fr 1fr',
            gap:'clamp(0.5rem,1vw,0.75rem)',
            width:'100%',
          }}>

            {/* HQ Card — spans full width */}
            <motion.div
              whileHover={{ scale:1.015, borderColor:'rgba(91,194,231,0.5)' }}
              transition={{ type:'spring', stiffness:300, damping:20 }}
              style={{
                gridColumn:'1 / -1',
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                gap:'clamp(0.3rem,0.6vw,0.5rem)',
                padding:'clamp(0.8rem,1.4vw,1.1rem) clamp(1rem,1.6vw,1.3rem)',
                background:'linear-gradient(135deg, rgba(91,194,231,0.08) 0%, rgba(91,194,231,0.02) 100%)',
                border:'1px solid rgba(91,194,231,0.22)',
                borderRadius:12,
                position:'relative', overflow:'hidden',
                cursor:'default',
              }}
            >
              {/* Ambient glow */}
              <div style={{ position:'absolute', top:'-30%', left:'-10%', width:'60%', height:'160%', background:'radial-gradient(ellipse, rgba(91,194,231,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'clamp(8px,0.9vw,10px)', letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(91,194,231,0.8)', fontWeight:700, position:'relative', zIndex:1 }}>
                {isAr ? 'المقر الرئيسي' : 'HEAD QUARTER'}
              </div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(1.05rem,2vw,1.4rem)', letterSpacing:'0.08em', lineHeight:1.1, textAlign:'center', position:'relative', zIndex:1,
                color:'#5BC2E7', textShadow:'0 0 24px rgba(91,194,231,0.6), 0 0 48px rgba(91,194,231,0.25)',
              }}>
                {isAr ? ar.globe.hq : 'DUBAI, UNITED ARAB EMIRATES'}
              </div>
            </motion.div>

          </div>

          {/* Branch offices — dot separated */}
          <div style={{ textAlign:'center' }}>
            <span style={{
              fontFamily:"'Bebas Neue',sans-serif",
              fontSize:'clamp(1.1rem,2.8vw,1.5rem)',
              letterSpacing:'0.08em',
              color:'rgba(255,255,255,0.75)',
              lineHeight:1,
            }}>
              {isAr ? 'السعودية · الإمارات · الهند · الصين' : 'SAUDI ARABIA · UAE · INDIA · CHINA'}
            </span>
          </div>

          {/* Tagline */}
          <motion.div
            animate={{ opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ display:'flex', alignItems:'center', gap:10, justifyContent:'center' }}
          >
            <div style={{ width:24, height:2, background:'linear-gradient(90deg, rgba(91,194,231,0.2), rgba(91,194,231,0.6))', flexShrink:0, borderRadius:1 }} />
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'clamp(0.7rem,1.2vw,0.88rem)',
              color:'rgba(91,194,231,1)', letterSpacing:'0.1em', textTransform:'uppercase',
              margin:0, fontWeight:600, lineHeight:1.5, textAlign:'center',
            }}>
              {isAr ? ar.globe.tagline : 'Strategically positioned for seamless global connectivity'}
            </p>
            <div style={{ width:24, height:2, background:'linear-gradient(90deg, rgba(91,194,231,0.6), rgba(91,194,231,0.2))', flexShrink:0, borderRadius:1 }} />
          </motion.div>

        </motion.div>
      </div>
  )

  if (embedded) {
    if (fullscreen) {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: 'clamp(1rem,3vw,2rem)' }}>
          <div style={{ width: '100%' }}>
            {inner}
          </div>
        </div>
      )
    }
    return inner
  }

  return (
    <section id="globe" style={{ padding: 'clamp(3rem,6vw,5rem) 1.5rem', position: 'relative', overflow: 'hidden', background: 'transparent' }}>
      <SparklesCore background="transparent" minSize={0.6} maxSize={2} particleDensity={60} particleColor="rgba(91,194,231,0.9)" speed={0.8} className="absolute inset-0 w-full h-full pointer-events-none" />
      {inner}
    </section>
  )
}
