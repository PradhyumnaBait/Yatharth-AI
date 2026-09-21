export async function simulateServiceLatency(serviceName: string): Promise<void> {
  // Check for simulated failure
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const failTarget = params.get('fail');
    if (failTarget && (failTarget === serviceName || failTarget === 'all')) {
      throw new Error(`Simulated service failure for ${serviceName}`);
    }
  }

  // Simulated latency: 150ms to 450ms
  const latency = 150 + Math.floor(Math.random() * 300);
  await new Promise((resolve) => setTimeout(resolve, latency));
}
