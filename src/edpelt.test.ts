import { EdPeltChangePointDetector } from "./edpelt.ts";
import { expect, test } from "bun:test";

const edpelt = EdPeltChangePointDetector.Instance;

test("edpelt GetChangePointIndexes", () => {
  // when:
  const result = edpelt.GetChangePointIndexes(
    [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2],
    1
  );

  // then:
  expect(result).toEqual([5, 11]);
});
