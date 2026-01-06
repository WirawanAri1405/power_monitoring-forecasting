// Fungsi untuk membuat angka random di antara min dan max
const randomValue = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

export const generateDummyData = (points = 50) => {
  const data = [];
  const now = new Date();

  // Generate data mundur ke belakang (seolah-olah history 24 jam)
  for (let i = 0; i < points; i++) {
    const time = new Date(now.getTime() - (points - i) * 15 * 60 * 1000); // interval 15 menit
    
    // Simulasi nilai yang realistis
    const voltage = randomValue(215, 225); // Tegangan stabil sekitar 220V
    const current = randomValue(1, 10);    // Arus berfluktuasi 1A - 10A
    const pf = randomValue(0.85, 0.99);    // Power Factor
    const power = voltage * current * pf;  // Hitus daya (Watt)
    
    data.push({
      timestamp: time.toISOString(),
      voltage: Number(voltage.toFixed(2)),
      current: Number(current.toFixed(2)),
      power: Number(power.toFixed(2)),
      power_factor: Number(pf.toFixed(2)),
      frequency: Number(randomValue(49.8, 50.2).toFixed(2)), // Frekuensi stabil 50Hz
    });
  }
  return data;
};

// Data static tunggal untuk Gauge Chart (Realtime mock)
export const dummyGaugeData = {
  voltage: 221.5,
  current: 5.4,
  power: 1250,
  power_factor: 0.92,
  frequency: 50.01,
};