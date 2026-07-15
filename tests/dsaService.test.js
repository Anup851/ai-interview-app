import test from 'node:test'
import assert from 'node:assert/strict'
import { reviewDsaSubmission, dsaProblems } from '../src/services/dsaService.js'

test('placeholder DSA submissions are not accepted', () => {
  const problem = dsaProblems.find((item) => item.id === 'two-sum')
  const weakCode = `function solve(input) {
    // Write your solution here.
    return null
  }`

  const review = reviewDsaSubmission(problem, weakCode, 'JavaScript')

  assert.equal(review.accepted, false)
  assert.ok(review.score < 75)
})

test('submissions with a concrete implementation can be accepted', () => {
  const problem = dsaProblems.find((item) => item.id === 'two-sum')
  const solidCode = `function solve(nums, target) {
    const map = new Map()
    for (let i = 0; i < nums.length; i += 1) {
      const complement = target - nums[i]
      if (map.has(complement)) return [map.get(complement), i]
      map.set(nums[i], i)
    }
    return []
  }`

  const review = reviewDsaSubmission(problem, solidCode, 'JavaScript')

  assert.equal(review.accepted, true)
})
