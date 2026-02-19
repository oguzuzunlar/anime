// Aurora Borealis Background — WebGL Fragment Shader
// Layered sinusoidal curtains with twinkling stars on a deep night sky.
// Drop-in replacement: just needs a <canvas id="bg-canvas"> in the DOM.

(function () {
    const canvas = document.getElementById('bg-canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) { console.warn('WebGL not supported'); return; }

    // ── Shaders ────────────────────────────────────────────────────────────────

    const VS = `
        attribute vec2 a_pos;
        void main() {
            gl_Position = vec4(a_pos, 0.0, 1.0);
        }
    `;

    // Aurora Borealis — layered sinusoidal curtains + stars
    const FS = `
        precision highp float;

        uniform vec2  u_res;
        uniform float u_time;

        // ── Hash / value noise ────────────────────────────────────────────────
        float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(
                mix(hash(i + vec2(0,0)), hash(i + vec2(1,0)), u.x),
                mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x),
                u.y);
        }

        // ── Twinkling stars ───────────────────────────────────────────────────
        float stars(vec2 uv, float count, float size) {
            vec2 grid = uv * count;
            vec2 i    = floor(grid);
            vec2 f    = fract(grid);
            float rnd = hash(i);
            vec2  pos = vec2(hash(i + vec2(7.3, 1.9)), hash(i + vec2(2.1, 8.7)));
            float d   = length(f - pos);
            float twinkle = 0.65 + 0.35 * sin(u_time * (1.8 + rnd * 3.5) + rnd * 6.28);
            return smoothstep(size, 0.0, d) * twinkle * step(0.82, rnd);
        }

        // ── Single aurora curtain ─────────────────────────────────────────────
        // Returns 0..1 intensity based on distance from animated wave baseline.
        float band(vec2 uv, float cy, float amp, float freq,
                   float speed, float width) {
            float t = u_time * speed;
            float wave =  amp        * sin(freq       * uv.x + t)
                        + amp * 0.50 * sin(freq * 1.7  * uv.x + t * 1.3  + 1.20)
                        + amp * 0.25 * sin(freq * 3.1  * uv.x + t * 0.7  + 2.40)
                        + amp * 0.12 * sin(freq * 5.3  * uv.x - t * 0.4  + 0.90);
            // fine-detail noise warp
            wave += noise(uv * vec2(3.0, 1.5) + vec2(t * 0.15, 0.0)) * 0.035;
            float dist = abs(uv.y - (cy + wave));
            return exp(-dist * dist / (width * width));
        }

        void main() {
            vec2 uv = gl_FragCoord.xy / u_res;
            uv.x   *= u_res.x / u_res.y;   // aspect-correct

            // ── Deep night sky ────────────────────────────────────────────────
            vec3 sky = mix(vec3(0.004, 0.008, 0.028),
                           vec3(0.008, 0.020, 0.048),
                           1.0 - uv.y);

            // ── Stars ─────────────────────────────────────────────────────────
            float s = stars(uv, 90.0,  0.008)
                    + stars(uv, 180.0, 0.005) * 0.55
                    + stars(uv, 40.0,  0.013) * 0.40;
            sky += s * vec3(0.88, 0.92, 1.00);

            // ── Horizon fade mask (aurora stays in upper sky) ─────────────────
            float mask = smoothstep(0.18, 0.52, uv.y);

            // ── Aurora bands ─────────────────────────────────────────────────
            // Layer 1 — wide emerald-green base
            float b1 = band(uv, 0.70, 0.09, 1.8, 0.22, 0.100) * mask;
            vec3  C1 = vec3(0.00, 0.72, 0.35);

            // Layer 2 — teal-cyan ribbon
            float b2 = band(uv, 0.63, 0.07, 2.5, 0.17, 0.055) * mask;
            vec3  C2 = vec3(0.00, 0.60, 0.62);

            // Layer 3 — violet/purple high arc
            float b3 = band(uv, 0.81, 0.11, 1.3, 0.14, 0.080) * mask;
            vec3  C3 = vec3(0.38, 0.08, 0.65);

            // Layer 4 — thin bright lime edge
            float b4 = band(uv, 0.66, 0.06, 3.2, 0.28, 0.028) * mask;
            vec3  C4 = vec3(0.55, 1.00, 0.28);

            // Layer 5 — soft pink/magenta fringe at top
            float b5 = band(uv, 0.88, 0.10, 1.0, 0.11, 0.060) * mask;
            vec3  C5 = vec3(0.72, 0.14, 0.48);

            // Layer 6 — deep blue shimmer near horizon
            float b6 = band(uv, 0.42, 0.05, 2.1, 0.19, 0.045) * mask;
            vec3  C6 = vec3(0.05, 0.28, 0.72);

            // ── Composite ────────────────────────────────────────────────────
            vec3 col = sky;
            col += b1 * C1 * 0.80;
            col += b2 * C2 * 0.70;
            col += b3 * C3 * 0.55;
            col += b4 * C4 * 0.95;
            col += b5 * C5 * 0.50;
            col += b6 * C6 * 0.45;

            // Glow bloom at hotspots
            float lum = max(max(b1, b2), max(b3, b4));
            col += lum * lum * vec3(0.08, 0.16, 0.12) * mask;

            // ── Vignette ─────────────────────────────────────────────────────
            vec2 vuv = gl_FragCoord.xy / u_res - 0.5;
            float vig = 1.0 - dot(vuv, vuv) * 2.4;
            col *= clamp(vig, 0.0, 1.0);

            gl_FragColor = vec4(col, 1.0);
        }
    `;

    // ── Compile shaders ────────────────────────────────────────────────────────
    function compile(type, src) {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
            console.error(gl.getShaderInfoLog(s));
        return s;
    }

    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER,   VS));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    // ── Full-screen quad ───────────────────────────────────────────────────────
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array([-1,-1, 1,-1, -1,1, 1,1]),
        gl.STATIC_DRAW);

    const loc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes  = gl.getUniformLocation(prog, 'u_res');
    const uTime = gl.getUniformLocation(prog, 'u_time');

    // ── Resize ─────────────────────────────────────────────────────────────────
    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(uRes, canvas.width, canvas.height);
    }
    window.addEventListener('resize', resize);
    resize();

    // ── Render loop ────────────────────────────────────────────────────────────
    function animate(now) {
        gl.uniform1f(uTime, now * 0.001);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
})();