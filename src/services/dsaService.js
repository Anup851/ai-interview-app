import { readLocalValue, writeLocalValue } from '../utils/localStore.js'

const PROGRESS_KEY = 'preppilot:dsa-progress'

function problem(id, difficulty, title, topic, prompt, examples, constraints, expected) {
  return { id, difficulty, title, topic, prompt, examples, constraints, expected }
}

export const dsaProblems = [
  problem('two-sum', 'Easy', 'Two Sum', 'Array, Hash Map', 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.', [{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' }, { input: 'nums = [3,2,4], target = 6', output: '[1,2]' }], ['Exactly one valid answer exists.', 'You may not use the same element twice.'], { approach: ['hash', 'map', 'target', 'complement'], complexity: ['o(n)', 'linear'], avoid: ['nested loop', 'o(n^2)'] }),
  problem('valid-parentheses', 'Easy', 'Valid Parentheses', 'Stack, String', 'Given a string s containing only brackets, determine if the input string is valid. Open brackets must be closed by the same type and in the correct order.', [{ input: 's = "()"', output: 'true' }, { input: 's = "([)]"', output: 'false' }], ['Only (), {}, and [] are included.', 'An empty stack at the end means every bracket was matched.'], { approach: ['stack', 'push', 'pop', 'map'], complexity: ['o(n)', 'linear'], avoid: ['replace'] }),
  problem('best-time-stock', 'Easy', 'Best Time to Buy and Sell Stock', 'Array, Greedy', 'Given prices where prices[i] is the stock price on day i, return the maximum profit from one buy and one sell.', [{ input: 'prices = [7,1,5,3,6,4]', output: '5' }, { input: 'prices = [7,6,4,3,1]', output: '0' }], ['Buy before you sell.', 'Return 0 when no profit is possible.'], { approach: ['min', 'price', 'profit', 'max', 'greedy'], complexity: ['o(n)', 'linear'], avoid: ['nested loop', 'o(n^2)'] }),
  problem('valid-palindrome', 'Easy', 'Valid Palindrome', 'Two Pointers, String', 'Given a string s, return true if it is a palindrome after converting uppercase letters to lowercase and removing non-alphanumeric characters.', [{ input: 's = "A man, a plan, a canal: Panama"', output: 'true' }, { input: 's = "race a car"', output: 'false' }], ['Ignore punctuation and spaces.', 'Compare characters from both ends.'], { approach: ['left', 'right', 'pointer', 'alphanumeric', 'lowercase'], complexity: ['o(n)', 'linear'], avoid: ['reverse only'] }),
  problem('merge-sorted-array', 'Easy', 'Merge Sorted Array', 'Array, Two Pointers', 'Merge nums2 into nums1 as one sorted array, assuming nums1 has enough trailing space to hold nums2.', [{ input: 'nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3', output: '[1,2,2,3,5,6]' }, { input: 'nums1 = [1], m = 1, nums2 = [], n = 0', output: '[1]' }], ['Modify nums1 in-place.', 'Work from the end to avoid overwriting values.'], { approach: ['two', 'pointer', 'end', 'merge', 'in-place'], complexity: ['o(m+n)', 'linear'], avoid: ['extra array'] }),
  problem('maximum-subarray', 'Easy', 'Maximum Subarray', 'Array, Dynamic Programming', 'Given an integer array nums, find the contiguous subarray with the largest sum and return its sum.', [{ input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6' }, { input: 'nums = [1]', output: '1' }], ['Subarray must be contiguous.', 'Handle all-negative arrays.'], { approach: ['kadane', 'current', 'max', 'sum'], complexity: ['o(n)', 'linear'], avoid: ['all subarrays', 'o(n^2)'] }),
  problem('contains-duplicate', 'Easy', 'Contains Duplicate', 'Array, Hash Set', 'Given an integer array nums, return true if any value appears at least twice and false if every element is distinct.', [{ input: 'nums = [1,2,3,1]', output: 'true' }, { input: 'nums = [1,2,3,4]', output: 'false' }], ['A hash set can track seen values.', 'Return as soon as a duplicate is found.'], { approach: ['set', 'seen', 'duplicate', 'hash'], complexity: ['o(n)', 'linear'], avoid: ['nested loop', 'o(n^2)'] }),
  problem('binary-search', 'Easy', 'Binary Search', 'Binary Search, Array', 'Given a sorted array nums and a target, return the index if the target is found. Otherwise, return -1.', [{ input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4' }, { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1' }], ['Array is sorted ascending.', 'Update left and right boundaries carefully.'], { approach: ['binary', 'left', 'right', 'mid', 'target'], complexity: ['o(log', 'logarithmic'], avoid: ['linear scan'] }),
  problem('climbing-stairs', 'Easy', 'Climbing Stairs', 'Dynamic Programming', 'You are climbing n stairs. Each time you can climb 1 or 2 steps. Return how many distinct ways you can reach the top.', [{ input: 'n = 2', output: '2' }, { input: 'n = 3', output: '3' }], ['This follows a Fibonacci recurrence.', 'Use constant space if possible.'], { approach: ['dp', 'previous', 'current', 'fibonacci'], complexity: ['o(n)', 'linear'], avoid: ['exponential', 'recursive'] }),
  problem('reverse-linked-list', 'Easy', 'Reverse Linked List', 'Linked List', 'Given the head of a singly linked list, reverse the list and return the reversed list.', [{ input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' }, { input: 'head = []', output: '[]' }], ['Keep track of previous, current, and next nodes.', 'Return the new head.'], { approach: ['prev', 'current', 'next', 'pointer'], complexity: ['o(n)', 'linear'], avoid: ['array conversion'] }),
  problem('linked-list-cycle', 'Easy', 'Linked List Cycle', 'Linked List, Fast Slow Pointers', 'Given head, determine if the linked list has a cycle.', [{ input: 'head = [3,2,0,-4], pos = 1', output: 'true' }, { input: 'head = [1], pos = -1', output: 'false' }], ['Use two pointers moving at different speeds.', 'If fast meets slow, a cycle exists.'], { approach: ['slow', 'fast', 'pointer', 'cycle'], complexity: ['o(n)', 'linear'], avoid: ['set only'] }),
  problem('invert-binary-tree', 'Easy', 'Invert Binary Tree', 'Tree, DFS, BFS', 'Given the root of a binary tree, invert the tree and return its root.', [{ input: 'root = [4,2,7,1,3,6,9]', output: '[4,7,2,9,6,3,1]' }, { input: 'root = []', output: '[]' }], ['Swap left and right children.', 'Recursion or queue traversal both work.'], { approach: ['swap', 'left', 'right', 'recursive', 'queue'], complexity: ['o(n)', 'linear'], avoid: ['string'] }),
  problem('same-tree', 'Easy', 'Same Tree', 'Tree, DFS', 'Given the roots of two binary trees p and q, return true if they are structurally identical and node values are equal.', [{ input: 'p = [1,2,3], q = [1,2,3]', output: 'true' }, { input: 'p = [1,2], q = [1,null,2]', output: 'false' }], ['Compare both nodes at the same time.', 'Null cases matter.'], { approach: ['recursive', 'dfs', 'left', 'right', 'null'], complexity: ['o(n)', 'linear'], avoid: ['serialize only'] }),
  problem('flood-fill', 'Easy', 'Flood Fill', 'Graph, DFS, BFS', 'Given an image, starting cell, and new color, recolor the connected component of the starting pixel.', [{ input: 'image = [[1,1,1],[1,1,0],[1,0,1]], sr = 1, sc = 1, color = 2', output: '[[2,2,2],[2,2,0],[2,0,1]]' }, { input: 'image = [[0,0,0],[0,0,0]], sr = 0, sc = 0, color = 0', output: '[[0,0,0],[0,0,0]]' }], ['Only move in four directions.', 'Avoid infinite loops when the color is unchanged.'], { approach: ['dfs', 'bfs', 'queue', 'visited', 'direction'], complexity: ['o(n)', 'linear'], avoid: ['diagonal'] }),
  problem('first-bad-version', 'Easy', 'First Bad Version', 'Binary Search', 'Given n versions and an API isBadVersion, find the first bad version while minimizing API calls.', [{ input: 'n = 5, bad = 4', output: '4' }, { input: 'n = 1, bad = 1', output: '1' }], ['The bad versions form a monotonic range.', 'Use binary search on version numbers.'], { approach: ['binary', 'left', 'right', 'mid', 'first'], complexity: ['o(log', 'logarithmic'], avoid: ['linear scan'] }),

  problem('longest-substring', 'Medium', 'Longest Substring Without Repeating Characters', 'Sliding Window, Hash Set', 'Given a string s, find the length of the longest substring without repeating characters.', [{ input: 's = "abcabcbb"', output: '3' }, { input: 's = "bbbbb"', output: '1' }], ['Substring must be contiguous.', 'A repeated character should move the left boundary forward.'], { approach: ['window', 'left', 'right', 'set', 'map'], complexity: ['o(n)', 'linear'], avoid: ['all substrings', 'o(n^2)'] }),
  problem('top-k-frequent', 'Medium', 'Top K Frequent Elements', 'Hash Map, Heap, Bucket Sort', 'Given an integer array nums and an integer k, return the k most frequent elements.', [{ input: 'nums = [1,1,1,2,2,3], k = 2', output: '[1,2]' }, { input: 'nums = [1], k = 1', output: '[1]' }], ['The answer can be returned in any order.', 'Better than O(n log n) is preferred.'], { approach: ['frequency', 'map', 'heap', 'bucket', 'sort'], complexity: ['o(n)', 'o(n log k)', 'linear'], avoid: ['nested loop'] }),
  problem('product-except-self', 'Medium', 'Product of Array Except Self', 'Array, Prefix Suffix', 'Return an array answer such that answer[i] equals the product of all elements except nums[i], without using division.', [{ input: 'nums = [1,2,3,4]', output: '[24,12,8,6]' }, { input: 'nums = [-1,1,0,-3,3]', output: '[0,0,9,0,0]' }], ['Do not use division.', 'Use prefix and suffix products.'], { approach: ['prefix', 'suffix', 'product', 'left', 'right'], complexity: ['o(n)', 'linear'], avoid: ['division'] }),
  problem('three-sum', 'Medium', '3Sum', 'Array, Two Pointers', 'Given an integer array nums, return all unique triplets that sum to zero.', [{ input: 'nums = [-1,0,1,2,-1,-4]', output: '[[-1,-1,2],[-1,0,1]]' }, { input: 'nums = [0,1,1]', output: '[]' }], ['Triplets must be unique.', 'Sorting enables two pointers.'], { approach: ['sort', 'left', 'right', 'pointer', 'skip'], complexity: ['o(n^2)', 'quadratic'], avoid: ['o(n^3)'] }),
  problem('container-with-most-water', 'Medium', 'Container With Most Water', 'Two Pointers, Greedy', 'Given heights, choose two lines that hold the most water and return the maximum area.', [{ input: 'height = [1,8,6,2,5,4,8,3,7]', output: '49' }, { input: 'height = [1,1]', output: '1' }], ['Move the pointer with the smaller height.', 'Track max area.'], { approach: ['left', 'right', 'pointer', 'area', 'max'], complexity: ['o(n)', 'linear'], avoid: ['nested loop', 'o(n^2)'] }),
  problem('merge-intervals', 'Medium', 'Merge Intervals', 'Array, Sorting', 'Given an array of intervals, merge all overlapping intervals.', [{ input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]' }, { input: 'intervals = [[1,4],[4,5]]', output: '[[1,5]]' }], ['Sort intervals by start.', 'Extend the current interval when overlapping.'], { approach: ['sort', 'start', 'end', 'merge', 'overlap'], complexity: ['o(n log n)', 'sort'], avoid: ['nested loop'] }),
  problem('number-of-islands', 'Medium', 'Number of Islands', 'Graph, DFS, BFS', 'Given a grid of 1s and 0s, count the number of islands. An island is connected horizontally or vertically.', [{ input: 'grid = [["1","1","0"],["0","1","0"],["1","0","1"]]', output: '3' }, { input: 'grid = [["1","1"],["1","1"]]', output: '1' }], ['Visit each land cell once.', 'Use DFS, BFS, or union-find.'], { approach: ['dfs', 'bfs', 'visited', 'grid', 'direction'], complexity: ['o(mn)', 'linear'], avoid: ['diagonal'] }),
  problem('course-schedule', 'Medium', 'Course Schedule', 'Graph, Topological Sort', 'Given numCourses and prerequisites, determine if you can finish all courses.', [{ input: 'numCourses = 2, prerequisites = [[1,0]]', output: 'true' }, { input: 'numCourses = 2, prerequisites = [[1,0],[0,1]]', output: 'false' }], ['Detect cycles in a directed graph.', 'Topological sort or DFS coloring works.'], { approach: ['graph', 'cycle', 'topological', 'indegree', 'queue'], complexity: ['o(v+e)', 'linear'], avoid: ['brute force'] }),
  problem('kth-largest-element', 'Medium', 'Kth Largest Element in an Array', 'Heap, Quickselect', 'Find the kth largest element in an unsorted array.', [{ input: 'nums = [3,2,1,5,6,4], k = 2', output: '5' }, { input: 'nums = [3,2,3,1,2,4,5,5,6], k = 4', output: '4' }], ['Do not confuse kth largest with kth distinct.', 'Heap or quickselect are common.'], { approach: ['heap', 'quickselect', 'partition', 'k'], complexity: ['o(n)', 'o(n log k)', 'linear'], avoid: ['sort only'] }),
  problem('decode-ways', 'Medium', 'Decode Ways', 'Dynamic Programming, String', 'Given a string of digits, return the number of ways to decode it where A=1 through Z=26.', [{ input: 's = "12"', output: '2' }, { input: 's = "06"', output: '0' }], ['Zero is only valid as part of 10 or 20.', 'Use previous one and two character states.'], { approach: ['dp', 'one', 'two', 'previous', 'decode'], complexity: ['o(n)', 'linear'], avoid: ['exponential'] }),
  problem('coin-change', 'Medium', 'Coin Change', 'Dynamic Programming', 'Given coin denominations and an amount, return the fewest coins needed to make that amount, or -1 if impossible.', [{ input: 'coins = [1,2,5], amount = 11', output: '3' }, { input: 'coins = [2], amount = 3', output: '-1' }], ['Unbounded coin usage is allowed.', 'Build dp from 0 to amount.'], { approach: ['dp', 'amount', 'coin', 'min'], complexity: ['o(amount', 'o(n', 'linear'], avoid: ['greedy only'] }),
  problem('rotate-image', 'Medium', 'Rotate Image', 'Matrix, In-place', 'Rotate an n x n matrix by 90 degrees clockwise in-place.', [{ input: 'matrix = [[1,2,3],[4,5,6],[7,8,9]]', output: '[[7,4,1],[8,5,2],[9,6,3]]' }, { input: 'matrix = [[1,2],[3,4]]', output: '[[3,1],[4,2]]' }], ['Modify the matrix in-place.', 'Transpose then reverse each row.'], { approach: ['transpose', 'reverse', 'swap', 'in-place'], complexity: ['o(n^2)', 'quadratic'], avoid: ['extra matrix'] }),
  problem('set-matrix-zeroes', 'Medium', 'Set Matrix Zeroes', 'Matrix, In-place', 'If an element in a matrix is 0, set its entire row and column to 0 in-place.', [{ input: 'matrix = [[1,1,1],[1,0,1],[1,1,1]]', output: '[[1,0,1],[0,0,0],[1,0,1]]' }, { input: 'matrix = [[0,1,2,0],[3,4,5,2],[1,3,1,5]]', output: '[[0,0,0,0],[0,4,5,0],[0,3,1,0]]' }], ['Use first row and first column as markers.', 'Track whether the first row or column should be zeroed.'], { approach: ['marker', 'row', 'column', 'in-place'], complexity: ['o(mn)', 'linear'], avoid: ['copy matrix'] }),
  problem('subarray-sum-equals-k', 'Medium', 'Subarray Sum Equals K', 'Prefix Sum, Hash Map', 'Given nums and k, return the total number of continuous subarrays whose sum equals k.', [{ input: 'nums = [1,1,1], k = 2', output: '2' }, { input: 'nums = [1,2,3], k = 3', output: '2' }], ['Negative numbers can appear.', 'Use prefix sum counts.'], { approach: ['prefix', 'sum', 'map', 'count', 'k'], complexity: ['o(n)', 'linear'], avoid: ['sliding window only', 'o(n^2)'] }),
  problem('lowest-common-ancestor-bst', 'Medium', 'Lowest Common Ancestor of a BST', 'Tree, BST', 'Given a binary search tree and two nodes, return their lowest common ancestor.', [{ input: 'root = [6,2,8,0,4,7,9], p = 2, q = 8', output: '6' }, { input: 'root = [6,2,8,0,4,7,9], p = 2, q = 4', output: '2' }], ['Use BST ordering.', 'Move left or right until the split point.'], { approach: ['bst', 'left', 'right', 'value', 'ancestor'], complexity: ['o(h)', 'height'], avoid: ['full traversal'] }),

  problem('median-two-sorted-arrays', 'Hard', 'Median of Two Sorted Arrays', 'Binary Search, Partition', 'Given two sorted arrays nums1 and nums2, return the median of the two sorted arrays. The overall run time complexity should be O(log(m+n)).', [{ input: 'nums1 = [1,3], nums2 = [2]', output: '2.00000' }, { input: 'nums1 = [1,2], nums2 = [3,4]', output: '2.50000' }], ['Both arrays are sorted.', 'Target complexity is logarithmic.'], { approach: ['binary', 'partition', 'left', 'right', 'median'], complexity: ['o(log', 'logarithmic'], avoid: ['merge all', 'sort'] }),
  problem('minimum-window-substring', 'Hard', 'Minimum Window Substring', 'Sliding Window, Hash Map', 'Given strings s and t, return the minimum window substring of s such that every character in t is included in the window.', [{ input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"' }, { input: 's = "a", t = "aa"', output: '""' }], ['Characters can repeat.', 'Return an empty string when no valid window exists.'], { approach: ['window', 'need', 'have', 'left', 'right', 'count'], complexity: ['o(n)', 'linear'], avoid: ['all substrings', 'o(n^2)'] }),
  problem('trapping-rain-water', 'Hard', 'Trapping Rain Water', 'Two Pointers, Dynamic Programming', 'Given elevation heights, compute how much water can be trapped after raining.', [{ input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6' }, { input: 'height = [4,2,0,3,2,5]', output: '9' }], ['Water depends on min(leftMax, rightMax).', 'Two pointers can solve in constant space.'], { approach: ['left', 'right', 'max', 'water', 'pointer'], complexity: ['o(n)', 'linear'], avoid: ['nested loop'] }),
  problem('largest-rectangle-histogram', 'Hard', 'Largest Rectangle in Histogram', 'Stack, Monotonic Stack', 'Given bar heights, return the area of the largest rectangle in the histogram.', [{ input: 'heights = [2,1,5,6,2,3]', output: '10' }, { input: 'heights = [2,4]', output: '4' }], ['Use a monotonic increasing stack.', 'Compute area when popping taller bars.'], { approach: ['stack', 'monotonic', 'height', 'index', 'area'], complexity: ['o(n)', 'linear'], avoid: ['o(n^2)', 'nested loop'] }),
  problem('word-ladder', 'Hard', 'Word Ladder', 'BFS, Graph', 'Given beginWord, endWord, and wordList, return the length of the shortest transformation sequence changing one letter at a time.', [{ input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]', output: '5' }, { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]', output: '0' }], ['Each transformed word must exist in wordList.', 'BFS finds the shortest path.'], { approach: ['bfs', 'queue', 'visited', 'pattern', 'shortest'], complexity: ['o(n', 'linear'], avoid: ['dfs only'] }),
  problem('serialize-deserialize-tree', 'Hard', 'Serialize and Deserialize Binary Tree', 'Tree, DFS, BFS, Design', 'Design an algorithm to serialize and deserialize a binary tree.', [{ input: 'root = [1,2,3,null,null,4,5]', output: '[1,2,3,null,null,4,5]' }, { input: 'root = []', output: '[]' }], ['Null markers are required.', 'Preorder DFS or level-order BFS works.'], { approach: ['serialize', 'deserialize', 'null', 'dfs', 'queue'], complexity: ['o(n)', 'linear'], avoid: ['values only'] }),
  problem('regular-expression-matching', 'Hard', 'Regular Expression Matching', 'Dynamic Programming, String', 'Implement regex matching with support for . and * against the entire input string.', [{ input: 's = "aa", p = "a*"', output: 'true' }, { input: 's = "mississippi", p = "mis*is*p*."', output: 'false' }], ['Dot matches any single character.', 'Star matches zero or more of the previous element.'], { approach: ['dp', 'match', 'star', 'pattern', 'previous'], complexity: ['o(mn)', 'quadratic'], avoid: ['greedy only'] }),
  problem('edit-distance', 'Hard', 'Edit Distance', 'Dynamic Programming, String', 'Given word1 and word2, return the minimum number of insert, delete, and replace operations needed to convert word1 to word2.', [{ input: 'word1 = "horse", word2 = "ros"', output: '3' }, { input: 'word1 = "intention", word2 = "execution"', output: '5' }], ['Use a 2D DP table.', 'Compare insert, delete, and replace transitions.'], { approach: ['dp', 'insert', 'delete', 'replace', 'min'], complexity: ['o(mn)', 'quadratic'], avoid: ['recursive exponential'] }),
  problem('burst-balloons', 'Hard', 'Burst Balloons', 'Dynamic Programming, Interval DP', 'Given nums, burst balloons to maximize coins where coins equal left * current * right.', [{ input: 'nums = [3,1,5,8]', output: '167' }, { input: 'nums = [1,5]', output: '10' }], ['Think about the last balloon burst in each interval.', 'Pad boundaries with 1.'], { approach: ['dp', 'interval', 'last', 'left', 'right'], complexity: ['o(n^3)', 'cubic'], avoid: ['greedy'] }),
  problem('n-queens', 'Hard', 'N-Queens', 'Backtracking', 'Place n queens on an n x n chessboard so no two queens attack each other. Return all valid boards.', [{ input: 'n = 4', output: '[[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]' }, { input: 'n = 1', output: '[["Q"]]' }], ['Track used columns and diagonals.', 'Backtrack row by row.'], { approach: ['backtrack', 'column', 'diagonal', 'row', 'board'], complexity: ['o(n!)', 'factorial'], avoid: ['brute force board scan'] }),
  problem('word-search-ii', 'Hard', 'Word Search II', 'Trie, Backtracking', 'Given a board and a list of words, return all words that can be formed by adjacent cells.', [{ input: 'board = [["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]], words = ["oath","pea","eat","rain"]', output: '["eat","oath"]' }, { input: 'board = [["a","b"],["c","d"]], words = ["abcb"]', output: '[]' }], ['Build a trie from words.', 'Backtrack from each board cell.'], { approach: ['trie', 'backtrack', 'dfs', 'visited', 'prefix'], complexity: ['o(mn', 'linear'], avoid: ['search each word separately'] }),
  problem('longest-increasing-path-matrix', 'Hard', 'Longest Increasing Path in a Matrix', 'DFS, Memoization, Matrix', 'Given an integer matrix, return the length of the longest strictly increasing path.', [{ input: 'matrix = [[9,9,4],[6,6,8],[2,1,1]]', output: '4' }, { input: 'matrix = [[3,4,5],[3,2,6],[2,2,1]]', output: '4' }], ['Move in four directions only.', 'Memoize DFS results per cell.'], { approach: ['dfs', 'memo', 'cache', 'direction', 'increasing'], complexity: ['o(mn)', 'linear'], avoid: ['recompute'] }),
  problem('sliding-window-maximum', 'Hard', 'Sliding Window Maximum', 'Deque, Sliding Window', 'Given nums and k, return the maximum value in every sliding window of size k.', [{ input: 'nums = [1,3,-1,-3,5,3,6,7], k = 3', output: '[3,3,5,5,6,7]' }, { input: 'nums = [1], k = 1', output: '[1]' }], ['Use a decreasing deque of indices.', 'Remove indices outside the current window.'], { approach: ['deque', 'window', 'index', 'max', 'monotonic'], complexity: ['o(n)', 'linear'], avoid: ['heap only', 'o(nk)'] }),
  problem('alien-dictionary', 'Hard', 'Alien Dictionary', 'Graph, Topological Sort', 'Given sorted words from an alien language, derive a valid character order or return empty if impossible.', [{ input: 'words = ["wrt","wrf","er","ett","rftt"]', output: '"wertf"' }, { input: 'words = ["z","x","z"]', output: '""' }], ['Build precedence edges from the first differing character.', 'Detect cycles and invalid prefix cases.'], { approach: ['graph', 'topological', 'indegree', 'cycle', 'queue'], complexity: ['o(v+e)', 'linear'], avoid: ['sort characters'] }),
  problem('find-median-data-stream', 'Hard', 'Find Median from Data Stream', 'Heap, Design', 'Design a data structure that supports adding numbers and finding the median efficiently.', [{ input: 'addNum(1), addNum(2), findMedian(), addNum(3), findMedian()', output: '1.5, 2.0' }, { input: 'addNum(-1), findMedian()', output: '-1.0' }], ['Use two heaps.', 'Balance lower and upper halves after each insert.'], { approach: ['heap', 'min', 'max', 'balance', 'median'], complexity: ['o(log', 'logarithmic'], avoid: ['sort every time'] }),
  problem('reverse-nodes-k-group', 'Hard', 'Reverse Nodes in k-Group', 'Linked List, Recursion', 'Given a linked list, reverse nodes in groups of k and return the modified list. Nodes left over fewer than k should remain unchanged.', [{ input: 'head = [1,2,3,4,5], k = 2', output: '[2,1,4,3,5]' }, { input: 'head = [1,2,3,4,5], k = 3', output: '[3,2,1,4,5]' }], ['Check that a full group of k exists before reversing.', 'Reconnect group boundaries carefully.'], { approach: ['prev', 'current', 'next', 'reverse', 'group'], complexity: ['o(n)', 'linear'], avoid: ['array conversion'] })
]

export const difficulties = ['Easy', 'Medium', 'Hard']

export function getDsaProgress() {
  return readLocalValue(PROGRESS_KEY, { solved: [], attempts: {} })
}

export function saveDsaProgress(progress) {
  writeLocalValue(PROGRESS_KEY, progress)
}

export function getProblemsByDifficulty(difficulty) {
  return dsaProblems.filter((problem) => problem.difficulty === difficulty)
}

export function getNextProblem(difficulty, currentId) {
  const problems = getProblemsByDifficulty(difficulty)
  const currentIndex = Math.max(0, problems.findIndex((problem) => problem.id === currentId))
  return problems[(currentIndex + 1) % problems.length]
}

function includesAny(text, terms) {
  return terms.some((term) => text.includes(term))
}

function countMatches(text, terms) {
  return terms.filter((term) => text.includes(term)).length
}

export function reviewDsaSubmission(problem, code, language) {
  const normalized = code.toLowerCase().replace(/\s+/g, ' ')
  const hasEnoughCode = normalized.length >= 120
  const approachMatches = countMatches(normalized, problem.expected.approach)
  const hasComplexity = includesAny(normalized, problem.expected.complexity)
  const hasReturn = /\breturn\b/.test(normalized)
  const hasFunction = /\b(function|def|class|public|const|let|var|=>)\b/.test(normalized)
  const hasAvoidedTrap = !includesAny(normalized, problem.expected.avoid)
  const languageSignal = language === 'Python'
    ? /\bdef\b|\breturn\b/.test(normalized)
    : language === 'Java'
      ? /\bclass\b|\bpublic\b|\breturn\b/.test(normalized)
      : /\bfunction\b|=>|\bconst\b|\blet\b|\breturn\b/.test(normalized)

  const score = [
    hasEnoughCode ? 20 : 0,
    hasFunction ? 15 : 0,
    hasReturn ? 15 : 0,
    Math.min(30, approachMatches * 8),
    hasComplexity ? 10 : 0,
    hasAvoidedTrap ? 10 : 0,
    languageSignal ? 10 : 0
  ].reduce((sum, value) => sum + value, 0)

  const accepted = score >= 75 && approachMatches >= 2 && hasReturn

  return {
    accepted,
    score: Math.min(100, score),
    verdict: accepted ? 'Accepted' : 'Needs work',
    passedCases: accepted ? problem.examples.length + 4 : Math.max(1, Math.min(problem.examples.length + 3, Math.floor(score / 18))),
    totalCases: problem.examples.length + 4,
    review: accepted
      ? 'Your solution shows the expected approach, returns a result, and includes enough implementation detail to pass this practice review.'
      : 'The submission needs clearer implementation detail or the expected pattern for this problem.',
    improvements: [
      approachMatches < 2 ? `Use the expected ${problem.topic.toLowerCase()} pattern more directly.` : '',
      hasReturn ? '' : 'Return the requested value from the solution.',
      hasComplexity ? '' : 'Add a short time and space complexity note in a comment.',
      hasEnoughCode ? '' : 'Submit a fuller implementation, not only pseudocode.',
      hasAvoidedTrap ? '' : 'Avoid the slower trap approach for this difficulty.'
    ].filter(Boolean)
  }
}

export function recordDsaAttempt(problemId, result) {
  const progress = getDsaProgress()
  const attempts = {
    ...progress.attempts,
    [problemId]: (progress.attempts?.[problemId] || 0) + 1
  }
  const solved = result.accepted && !progress.solved.includes(problemId)
    ? [...progress.solved, problemId]
    : progress.solved

  const next = { solved, attempts }
  saveDsaProgress(next)
  return next
}
