// Live-Demo für die Projektseite: ersetzt Bridge und iCUE durch simulierte Werte.
// Wird von tools/make_site.mjs vor allen anderen Skripten in eine Kopie von widget/index.html eingefügt.
(function () {
	const lang = new URLSearchParams(location.search).get("lang") === "en" ? "en" : "de";

	// Übersetzungen wie in iCUE über tr() bereitstellen
	let dict = {};
	try {
		const xhr = new XMLHttpRequest();
		xhr.open("GET", "translation.json", false);
		xhr.send();
		dict = JSON.parse(xhr.responseText)[lang].translation;
	} catch (e) { }
	try { localStorage.clear(); } catch (e) { }
	window.tr = async (k) => dict[k] || k;
	window.iCUE_initialized = true;

	// Alle Seiten einschalten, sonst gelten die Standardwerte des Widgets
	for (let i = 1; i <= 7; i++) window["showPage" + i] = true;

	// ------------------------------------------------------------ Simulation
	const PSU_W = 600;
	const SCENARIOS = {
		idle: { w: 68, share: [1.02, 0.98, 1.01, 0.97, 1.03, 0.99], gpuLoad: 4, gpuTemp: 44 },
		load: { w: 535, share: [1.03, 1.06, 0.99, 0.95, 1.04, 0.93], gpuLoad: 97, gpuTemp: 68 },
		imbalance: { w: 520, share: [1.05, 1.0, 1.06, 0.35, 1.55, 0.99], gpuLoad: 96, gpuTemp: 69 }
	};
	let scenario = "load";
	const s = { w: 400, pins: [6, 6, 6, 6, 6, 6], tIn: 40, tOut: 47, gpuTemp: 60, gpuLoad: 80 };
	const peaks = { w: 0, pinA: [0, 0, 0, 0, 0, 0], tempC: 0, since: Date.now() };
	const history = [];
	const ease = (cur, target, k) => cur + (target - cur) * k;
	const noise = (amp) => (Math.random() * 2 - 1) * amp;

	function step() {
		const sc = SCENARIOS[scenario];
		const wave = scenario === "idle" ? 0 : Math.sin(Date.now() / 9000) * 25;
		s.w = ease(s.w, sc.w + wave + noise(sc.w * 0.03), 0.35);
		const totalA = s.w / 12.08;
		s.pins = s.pins.map((a, i) => ease(a, (totalA / 6) * sc.share[i] * (1 + noise(0.02)), 0.4));
		const hot = s.w / PSU_W;
		s.tIn = ease(s.tIn, 35 + hot * 12, 0.03);
		s.tOut = ease(s.tOut, 38 + hot * 22, 0.03);
		s.gpuTemp = ease(s.gpuTemp, sc.gpuTemp, 0.05);
		s.gpuLoad = ease(s.gpuLoad, sc.gpuLoad + noise(2), 0.3);
		peaks.w = Math.max(peaks.w, s.w);
		peaks.pinA = peaks.pinA.map((p, i) => Math.max(p, s.pins[i]));
		peaks.tempC = Math.max(peaks.tempC, s.tIn, s.tOut);
		history.push([Date.now(), +s.w.toFixed(1), +totalA.toFixed(2)]);
		if (history.length > 1800) history.shift();
	}

	// 30 Minuten Vorgeschichte, damit der Verlauf nicht leer ist
	(function prefill() {
		const now = Date.now();
		for (let i = 1800; i > 0; i--) {
			const t = now - i * 1000;
			const phase = (1800 - i) / 1800;
			const w = phase < 0.15 ? 70 : 380 + Math.sin(t / 60000) * 120 + Math.sin(t / 7000) * 25 + noise(12);
			history.push([t, +w.toFixed(1), +(w / 12.08).toFixed(2)]);
		}
		peaks.w = 590;
		peaks.pinA = [8.9, 9.2, 8.8, 8.1, 9.6, 8.4];
		peaks.tempC = 45.5;
	})();
	step();
	setInterval(step, 1000);

	function readings() {
		const fanDuty = Math.round(Math.max(0, Math.min(100, ((Math.max(s.tIn, s.tOut) - 50) / 30) * 100)));
		const pins = s.pins.map((a) => {
			const v = 12.12 - a * 0.006 + noise(0.004);
			return { v: +v.toFixed(3), a: +a.toFixed(3), w: +(v * a).toFixed(2) };
		});
		const totalW = pins.reduce((x, p) => x + p.w, 0);
		const totalA = pins.reduce((x, p) => x + p.a, 0);
		return {
			connected: true, source: "demo", time: Date.now(), port: "DEMO",
			pins, totalW: +totalW.toFixed(1), totalA: +totalA.toFixed(2),
			avgV: +(pins.reduce((x, p) => x + p.v, 0) / 6).toFixed(2),
			temps: { in: +s.tIn.toFixed(1), out: +s.tOut.toFixed(1), ext1: null, ext2: null },
			vdd: 3.41, fanDuty, psuCapW: PSU_W, faultStatus: 0, faultLog: 0,
			peaks: { w: +peaks.w.toFixed(1), pinA: peaks.pinA.map((a) => +a.toFixed(3)), tempC: +peaks.tempC.toFixed(1), since: peaks.since },
			device: {
				product: "Thermal Grizzly WireView Pro II", firmware: 5, build: "DEMO", serial: "DEMO",
				limits: { tempC: 80, ocpA: 55, wireOcpA: 10.5, oppW: 660, imbalancePct: 40, imbalanceMinLoadA: 6 },
				fan: { mode: "curve", source: "max", dutyMin: 0, dutyMax: 100, tempMinC: 50, tempMaxC: 80 }
			},
			gpu: {
				available: true, name: "NVIDIA GeForce RTX 5090", loadPct: Math.round(s.gpuLoad), tempC: Math.round(s.gpuTemp),
				powerW: +(totalW + 8 + s.gpuLoad * 0.1).toFixed(1), powerLimitW: 575,
				coreMHz: Math.round(1340 + s.gpuLoad * 14), memMHz: 14001,
				vramUsedMiB: Math.round(1700 + s.gpuLoad * 172), vramTotalMiB: 32607, fanPct: Math.round(s.gpuLoad * 0.6)
			}
		};
	}

	function historyResponse(u) {
		const seconds = parseInt(u.searchParams.get("seconds")) || 300;
		const points = parseInt(u.searchParams.get("points")) || 120;
		const now = Date.now();
		const inRange = history.filter((p) => p[0] >= now - seconds * 1000);
		const step = Math.max(1, Math.ceil(inRange.length / points));
		return { now, seconds, points: inRange.filter((_, i) => i % step === 0 || i === inRange.length - 1) };
	}

	const HEALTH = {
		enabled: true, minLoadA: 10, minMinutes: 15,
		reference: {
			from: "2026-09-20", to: "2026-09-20", minutes: 62, avgLoadA: 40.1, imbAvg: 6.1, imbMax: 9.8,
			dev: [1.8, 3.1, -1.2, -4.0, 2.0, -1.7], drop: [2.1, 3.0, -1.0, -3.5, 1.4, -2.0], mohm: [0.3, 0.5, -0.2, -0.6, 0.2, -0.2]
		},
		referenceFinal: true,
		recent: { minutes: 95, avgLoadA: 41.3, imbAvg: 6.4, imbMax: 10.2, dev: [2.2, 3.5, -0.9, -4.6, 2.3, -2.5], mohm: [0.3, 0.6, -0.2, -0.4, 0.2, -0.3] },
		today: { minutes: 34 }, totalMinutes: 1240, days: []
	};

	const realFetch = window.fetch.bind(window);
	window.fetch = async (url, opts) => {
		if (typeof url === "string" && url.startsWith("http://localhost:8787")) {
			const u = new URL(url);
			let body;
			if (u.pathname === "/readings") body = readings();
			else if (u.pathname === "/history") body = historyResponse(u);
			else if (u.pathname === "/health") body = HEALTH;
			else if (u.pathname === "/reset-peaks") {
				peaks.w = s.w; peaks.pinA = s.pins.slice(); peaks.tempC = Math.max(s.tIn, s.tOut); peaks.since = Date.now();
				body = { ok: true };
			} else return new Response("", { status: 404 });
			return new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });
		}
		return realFetch(url, opts);
	};

	// Steuerung von der Projektseite aus
	window.addEventListener("message", (e) => {
		const m = e.data || {};
		if (m.scenario && SCENARIOS[m.scenario]) scenario = m.scenario;
		if (m.dial) document.dispatchEvent(new MouseEvent(m.dial === "long-press" ? "contextmenu" : "click", { bubbles: true, cancelable: true }));
	});

	// Open Sans wie auf dem Gerät (iCUE lädt sie intern über qrc:)
	document.addEventListener("DOMContentLoaded", () => {
		const st = document.createElement("style");
		st.textContent = 'body, body * { font-family: "Open Sans", "Segoe UI", sans-serif !important; } html, body { cursor: pointer; user-select: none; }';
		document.head.appendChild(st);
	});
})();
