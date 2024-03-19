// Adapted from Akinshin 2019, https://aakinshin.net/posts/edpelt/.

export class EdPeltChangePointDetector {
  static Instance: EdPeltChangePointDetector = new EdPeltChangePointDetector();

  GetChangePointIndexes(data: number[], minDistance: number = 1): number[] {
    let n: number = data.length;

    if (n <= 2) return [];
    if (minDistance < 1 || minDistance > n) {
      throw new Error(
        `${minDistance} should be in range from 1 to data.Length`
      );
    }

    let penalty: number = 3 * Math.log(n);
    let k: number = Math.min(n, Math.ceil(4 * Math.log(n)));
    let partialSums: number[][] = this.GetPartialSums(data, k);

    let Cost = (tau1: number, tau2: number): number => {
      return this.GetSegmentCost(partialSums, tau1, tau2, k, n);
    };

    let bestCost: number[] = new Array(n + 1).fill(0);
    bestCost[0] = -penalty;
    for (
      let currentTau = minDistance;
      currentTau < 2 * minDistance;
      currentTau++
    )
      bestCost[currentTau] = Cost(0, currentTau);

    let previousChangePointIndex: number[] = new Array(n + 1).fill(0);
    let previousTaus: number[] = [0, minDistance];
    let costForPreviousTau: number[] = [];

    for (let currentTau = 2 * minDistance; currentTau < n + 1; currentTau++) {
      costForPreviousTau = previousTaus.map(
        (previousTau) =>
          bestCost[previousTau] + Cost(previousTau, currentTau) + penalty
      );

      let bestPreviousTauIndex: number = this.WhichMin(costForPreviousTau);
      bestCost[currentTau] = costForPreviousTau[bestPreviousTauIndex];
      previousChangePointIndex[currentTau] = previousTaus[bestPreviousTauIndex];

      let currentBestCost: number = bestCost[currentTau];
      previousTaus = previousTaus.filter(
        (_, i) => costForPreviousTau[i] < currentBestCost + penalty
      );
      previousTaus.push(currentTau - (minDistance - 1));
    }

    let changePointIndexes: number[] = [];
    let currentIndex: number = previousChangePointIndex[n];
    while (currentIndex !== 0) {
      changePointIndexes.push(currentIndex - 1);
      currentIndex = previousChangePointIndex[currentIndex];
    }
    changePointIndexes.reverse();
    return changePointIndexes;
  }

  private GetPartialSums(data: number[], k: number): number[][] {
    let n: number = data.length;
    let partialSums: number[][] = Array.from({ length: k }, () =>
      new Array(n + 1).fill(0)
    );
    let sortedData: number[] = data.slice().sort((a, b) => a - b);

    for (let i = 0; i < k; i++) {
      let z: number = -1 + (2 * i + 1) / k;
      let p: number = 1 / (1 + Math.pow(2 * n - 1, -z));
      let t: number = sortedData[Math.trunc((n - 1) * p)];

      for (let tau = 1; tau <= n; tau++) {
        partialSums[i][tau] = partialSums[i][tau - 1];
        if (data[tau - 1] < t) partialSums[i][tau] += 2;
        if (data[tau - 1] === t) partialSums[i][tau] += 1;
      }
    }
    return partialSums;
  }

  private GetSegmentCost(
    partialSums: number[][],
    tau1: number,
    tau2: number,
    k: number,
    n: number
  ): number {
    let sum: number = 0;
    for (let i = 0; i < k; i++) {
      let actualSum: number = partialSums[i][tau2] - partialSums[i][tau1];
      if (actualSum !== 0 && actualSum !== (tau2 - tau1) * 2) {
        let fit: number = (actualSum * 0.5) / (tau2 - tau1);
        let lnp: number =
          (tau2 - tau1) * (fit * Math.log(fit) + (1 - fit) * Math.log(1 - fit));
        sum += lnp;
      }
    }
    let c: number = -Math.log(2 * n - 1);
    return ((2.0 * c) / k) * sum;
  }

  private WhichMin(values: number[]): number {
    if (values.length === 0) {
      throw new Error("Array should contain elements");
    }

    let minValue: number = values[0];
    let minIndex: number = 0;
    for (let i = 1; i < values.length; i++)
      if (values[i] < minValue) {
        minValue = values[i];
        minIndex = i;
      }

    return minIndex;
  }
}
