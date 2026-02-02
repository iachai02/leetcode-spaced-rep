-- Seed problems and link them to problem sets
-- Run this in Supabase SQL Editor after problem_sets are created

-- First, insert all unique problems (uses ON CONFLICT to skip duplicates)
INSERT INTO problems (leetcode_id, title, difficulty, url, tags) VALUES
(1, 'Two Sum', 'Easy', 'https://leetcode.com/problems/two-sum/', ARRAY['Array', 'Hash Table']),
(2, 'Add Two Numbers', 'Medium', 'https://leetcode.com/problems/add-two-numbers/', ARRAY['Linked List', 'Math', 'Recursion']),
(3, 'Longest Substring Without Repeating Characters', 'Medium', 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', ARRAY['Hash Table', 'String', 'Sliding Window']),
(4, 'Median of Two Sorted Arrays', 'Hard', 'https://leetcode.com/problems/median-of-two-sorted-arrays/', ARRAY['Array', 'Binary Search', 'Divide and Conquer']),
(5, 'Longest Palindromic Substring', 'Medium', 'https://leetcode.com/problems/longest-palindromic-substring/', ARRAY['String', 'Dynamic Programming']),
(7, 'Reverse Integer', 'Medium', 'https://leetcode.com/problems/reverse-integer/', ARRAY['Math']),
(10, 'Regular Expression Matching', 'Hard', 'https://leetcode.com/problems/regular-expression-matching/', ARRAY['String', 'Dynamic Programming', 'Recursion']),
(11, 'Container With Most Water', 'Medium', 'https://leetcode.com/problems/container-with-most-water/', ARRAY['Array', 'Two Pointers', 'Greedy']),
(15, '3Sum', 'Medium', 'https://leetcode.com/problems/3sum/', ARRAY['Array', 'Two Pointers', 'Sorting']),
(17, 'Letter Combinations of a Phone Number', 'Medium', 'https://leetcode.com/problems/letter-combinations-of-a-phone-number/', ARRAY['Hash Table', 'String', 'Backtracking']),
(19, 'Remove Nth Node From End of List', 'Medium', 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/', ARRAY['Linked List', 'Two Pointers']),
(20, 'Valid Parentheses', 'Easy', 'https://leetcode.com/problems/valid-parentheses/', ARRAY['String', 'Stack']),
(21, 'Merge Two Sorted Lists', 'Easy', 'https://leetcode.com/problems/merge-two-sorted-lists/', ARRAY['Linked List', 'Recursion']),
(22, 'Generate Parentheses', 'Medium', 'https://leetcode.com/problems/generate-parentheses/', ARRAY['String', 'Dynamic Programming', 'Backtracking']),
(23, 'Merge k Sorted Lists', 'Hard', 'https://leetcode.com/problems/merge-k-sorted-lists/', ARRAY['Linked List', 'Divide and Conquer', 'Heap', 'Merge Sort']),
(25, 'Reverse Nodes in k-Group', 'Hard', 'https://leetcode.com/problems/reverse-nodes-in-k-group/', ARRAY['Linked List', 'Recursion']),
(33, 'Search in Rotated Sorted Array', 'Medium', 'https://leetcode.com/problems/search-in-rotated-sorted-array/', ARRAY['Array', 'Binary Search']),
(36, 'Valid Sudoku', 'Medium', 'https://leetcode.com/problems/valid-sudoku/', ARRAY['Array', 'Hash Table', 'Matrix']),
(39, 'Combination Sum', 'Medium', 'https://leetcode.com/problems/combination-sum/', ARRAY['Array', 'Backtracking']),
(40, 'Combination Sum II', 'Medium', 'https://leetcode.com/problems/combination-sum-ii/', ARRAY['Array', 'Backtracking']),
(42, 'Trapping Rain Water', 'Hard', 'https://leetcode.com/problems/trapping-rain-water/', ARRAY['Array', 'Two Pointers', 'Dynamic Programming', 'Stack', 'Monotonic Stack']),
(43, 'Multiply Strings', 'Medium', 'https://leetcode.com/problems/multiply-strings/', ARRAY['Math', 'String', 'Simulation']),
(45, 'Jump Game II', 'Medium', 'https://leetcode.com/problems/jump-game-ii/', ARRAY['Array', 'Dynamic Programming', 'Greedy']),
(46, 'Permutations', 'Medium', 'https://leetcode.com/problems/permutations/', ARRAY['Array', 'Backtracking']),
(48, 'Rotate Image', 'Medium', 'https://leetcode.com/problems/rotate-image/', ARRAY['Array', 'Math', 'Matrix']),
(49, 'Group Anagrams', 'Medium', 'https://leetcode.com/problems/group-anagrams/', ARRAY['Array', 'Hash Table', 'String', 'Sorting']),
(50, 'Pow(x, n)', 'Medium', 'https://leetcode.com/problems/powx-n/', ARRAY['Math', 'Recursion']),
(51, 'N-Queens', 'Hard', 'https://leetcode.com/problems/n-queens/', ARRAY['Array', 'Backtracking']),
(53, 'Maximum Subarray', 'Medium', 'https://leetcode.com/problems/maximum-subarray/', ARRAY['Array', 'Divide and Conquer', 'Dynamic Programming']),
(54, 'Spiral Matrix', 'Medium', 'https://leetcode.com/problems/spiral-matrix/', ARRAY['Array', 'Matrix', 'Simulation']),
(55, 'Jump Game', 'Medium', 'https://leetcode.com/problems/jump-game/', ARRAY['Array', 'Dynamic Programming', 'Greedy']),
(56, 'Merge Intervals', 'Medium', 'https://leetcode.com/problems/merge-intervals/', ARRAY['Array', 'Sorting']),
(57, 'Insert Interval', 'Medium', 'https://leetcode.com/problems/insert-interval/', ARRAY['Array']),
(62, 'Unique Paths', 'Medium', 'https://leetcode.com/problems/unique-paths/', ARRAY['Math', 'Dynamic Programming', 'Combinatorics']),
(66, 'Plus One', 'Easy', 'https://leetcode.com/problems/plus-one/', ARRAY['Array', 'Math']),
(70, 'Climbing Stairs', 'Easy', 'https://leetcode.com/problems/climbing-stairs/', ARRAY['Math', 'Dynamic Programming', 'Memoization']),
(72, 'Edit Distance', 'Medium', 'https://leetcode.com/problems/edit-distance/', ARRAY['String', 'Dynamic Programming']),
(73, 'Set Matrix Zeroes', 'Medium', 'https://leetcode.com/problems/set-matrix-zeroes/', ARRAY['Array', 'Hash Table', 'Matrix']),
(74, 'Search a 2D Matrix', 'Medium', 'https://leetcode.com/problems/search-a-2d-matrix/', ARRAY['Array', 'Binary Search', 'Matrix']),
(76, 'Minimum Window Substring', 'Hard', 'https://leetcode.com/problems/minimum-window-substring/', ARRAY['Hash Table', 'String', 'Sliding Window']),
(78, 'Subsets', 'Medium', 'https://leetcode.com/problems/subsets/', ARRAY['Array', 'Backtracking', 'Bit Manipulation']),
(79, 'Word Search', 'Medium', 'https://leetcode.com/problems/word-search/', ARRAY['Array', 'Backtracking', 'Matrix']),
(84, 'Largest Rectangle in Histogram', 'Hard', 'https://leetcode.com/problems/largest-rectangle-in-histogram/', ARRAY['Array', 'Stack', 'Monotonic Stack']),
(90, 'Subsets II', 'Medium', 'https://leetcode.com/problems/subsets-ii/', ARRAY['Array', 'Backtracking', 'Bit Manipulation']),
(91, 'Decode Ways', 'Medium', 'https://leetcode.com/problems/decode-ways/', ARRAY['String', 'Dynamic Programming']),
(97, 'Interleaving String', 'Medium', 'https://leetcode.com/problems/interleaving-string/', ARRAY['String', 'Dynamic Programming']),
(98, 'Validate Binary Search Tree', 'Medium', 'https://leetcode.com/problems/validate-binary-search-tree/', ARRAY['Tree', 'Depth-First Search', 'Binary Search Tree', 'Binary Tree']),
(100, 'Same Tree', 'Easy', 'https://leetcode.com/problems/same-tree/', ARRAY['Tree', 'Depth-First Search', 'Breadth-First Search', 'Binary Tree']),
(102, 'Binary Tree Level Order Traversal', 'Medium', 'https://leetcode.com/problems/binary-tree-level-order-traversal/', ARRAY['Tree', 'Breadth-First Search', 'Binary Tree']),
(104, 'Maximum Depth of Binary Tree', 'Easy', 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', ARRAY['Tree', 'Depth-First Search', 'Breadth-First Search', 'Binary Tree']),
(105, 'Construct Binary Tree from Preorder and Inorder Traversal', 'Medium', 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/', ARRAY['Array', 'Hash Table', 'Divide and Conquer', 'Tree', 'Binary Tree']),
(110, 'Balanced Binary Tree', 'Easy', 'https://leetcode.com/problems/balanced-binary-tree/', ARRAY['Tree', 'Depth-First Search', 'Binary Tree']),
(115, 'Distinct Subsequences', 'Hard', 'https://leetcode.com/problems/distinct-subsequences/', ARRAY['String', 'Dynamic Programming']),
(121, 'Best Time to Buy and Sell Stock', 'Easy', 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', ARRAY['Array', 'Dynamic Programming']),
(124, 'Binary Tree Maximum Path Sum', 'Hard', 'https://leetcode.com/problems/binary-tree-maximum-path-sum/', ARRAY['Dynamic Programming', 'Tree', 'Depth-First Search', 'Binary Tree']),
(125, 'Valid Palindrome', 'Easy', 'https://leetcode.com/problems/valid-palindrome/', ARRAY['Two Pointers', 'String']),
(127, 'Word Ladder', 'Hard', 'https://leetcode.com/problems/word-ladder/', ARRAY['Hash Table', 'String', 'Breadth-First Search']),
(128, 'Longest Consecutive Sequence', 'Medium', 'https://leetcode.com/problems/longest-consecutive-sequence/', ARRAY['Array', 'Hash Table', 'Union Find']),
(130, 'Surrounded Regions', 'Medium', 'https://leetcode.com/problems/surrounded-regions/', ARRAY['Array', 'Depth-First Search', 'Breadth-First Search', 'Union Find', 'Matrix']),
(131, 'Palindrome Partitioning', 'Medium', 'https://leetcode.com/problems/palindrome-partitioning/', ARRAY['String', 'Dynamic Programming', 'Backtracking']),
(133, 'Clone Graph', 'Medium', 'https://leetcode.com/problems/clone-graph/', ARRAY['Hash Table', 'Depth-First Search', 'Breadth-First Search', 'Graph']),
(134, 'Gas Station', 'Medium', 'https://leetcode.com/problems/gas-station/', ARRAY['Array', 'Greedy']),
(136, 'Single Number', 'Easy', 'https://leetcode.com/problems/single-number/', ARRAY['Array', 'Bit Manipulation']),
(138, 'Copy List with Random Pointer', 'Medium', 'https://leetcode.com/problems/copy-list-with-random-pointer/', ARRAY['Hash Table', 'Linked List']),
(139, 'Word Break', 'Medium', 'https://leetcode.com/problems/word-break/', ARRAY['Array', 'Hash Table', 'String', 'Dynamic Programming', 'Trie', 'Memoization']),
(141, 'Linked List Cycle', 'Easy', 'https://leetcode.com/problems/linked-list-cycle/', ARRAY['Hash Table', 'Linked List', 'Two Pointers']),
(143, 'Reorder List', 'Medium', 'https://leetcode.com/problems/reorder-list/', ARRAY['Linked List', 'Two Pointers', 'Stack', 'Recursion']),
(146, 'LRU Cache', 'Medium', 'https://leetcode.com/problems/lru-cache/', ARRAY['Hash Table', 'Linked List', 'Design', 'Doubly-Linked List']),
(150, 'Evaluate Reverse Polish Notation', 'Medium', 'https://leetcode.com/problems/evaluate-reverse-polish-notation/', ARRAY['Array', 'Math', 'Stack']),
(151, 'Reverse Words in a String', 'Medium', 'https://leetcode.com/problems/reverse-words-in-a-string/', ARRAY['Two Pointers', 'String']),
(152, 'Maximum Product Subarray', 'Medium', 'https://leetcode.com/problems/maximum-product-subarray/', ARRAY['Array', 'Dynamic Programming']),
(153, 'Find Minimum in Rotated Sorted Array', 'Medium', 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/', ARRAY['Array', 'Binary Search']),
(155, 'Min Stack', 'Medium', 'https://leetcode.com/problems/min-stack/', ARRAY['Stack', 'Design']),
(162, 'Find Peak Element', 'Medium', 'https://leetcode.com/problems/find-peak-element/', ARRAY['Array', 'Binary Search']),
(167, 'Two Sum II - Input Array Is Sorted', 'Medium', 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/', ARRAY['Array', 'Two Pointers', 'Binary Search']),
(190, 'Reverse Bits', 'Easy', 'https://leetcode.com/problems/reverse-bits/', ARRAY['Divide and Conquer', 'Bit Manipulation']),
(191, 'Number of 1 Bits', 'Easy', 'https://leetcode.com/problems/number-of-1-bits/', ARRAY['Divide and Conquer', 'Bit Manipulation']),
(198, 'House Robber', 'Medium', 'https://leetcode.com/problems/house-robber/', ARRAY['Array', 'Dynamic Programming']),
(199, 'Binary Tree Right Side View', 'Medium', 'https://leetcode.com/problems/binary-tree-right-side-view/', ARRAY['Tree', 'Depth-First Search', 'Breadth-First Search', 'Binary Tree']),
(200, 'Number of Islands', 'Medium', 'https://leetcode.com/problems/number-of-islands/', ARRAY['Array', 'Depth-First Search', 'Breadth-First Search', 'Union Find', 'Matrix']),
(202, 'Happy Number', 'Easy', 'https://leetcode.com/problems/happy-number/', ARRAY['Hash Table', 'Math', 'Two Pointers']),
(206, 'Reverse Linked List', 'Easy', 'https://leetcode.com/problems/reverse-linked-list/', ARRAY['Linked List', 'Recursion']),
(207, 'Course Schedule', 'Medium', 'https://leetcode.com/problems/course-schedule/', ARRAY['Depth-First Search', 'Breadth-First Search', 'Graph', 'Topological Sort']),
(208, 'Implement Trie (Prefix Tree)', 'Medium', 'https://leetcode.com/problems/implement-trie-prefix-tree/', ARRAY['Hash Table', 'String', 'Design', 'Trie']),
(210, 'Course Schedule II', 'Medium', 'https://leetcode.com/problems/course-schedule-ii/', ARRAY['Depth-First Search', 'Breadth-First Search', 'Graph', 'Topological Sort']),
(211, 'Design Add and Search Words Data Structure', 'Medium', 'https://leetcode.com/problems/design-add-and-search-words-data-structure/', ARRAY['String', 'Depth-First Search', 'Design', 'Trie']),
(212, 'Word Search II', 'Hard', 'https://leetcode.com/problems/word-search-ii/', ARRAY['Array', 'String', 'Backtracking', 'Trie', 'Matrix']),
(213, 'House Robber II', 'Medium', 'https://leetcode.com/problems/house-robber-ii/', ARRAY['Array', 'Dynamic Programming']),
(215, 'Kth Largest Element in an Array', 'Medium', 'https://leetcode.com/problems/kth-largest-element-in-an-array/', ARRAY['Array', 'Divide and Conquer', 'Sorting', 'Heap', 'Quickselect']),
(216, 'Combination Sum III', 'Medium', 'https://leetcode.com/problems/combination-sum-iii/', ARRAY['Array', 'Backtracking']),
(217, 'Contains Duplicate', 'Easy', 'https://leetcode.com/problems/contains-duplicate/', ARRAY['Array', 'Hash Table', 'Sorting']),
(226, 'Invert Binary Tree', 'Easy', 'https://leetcode.com/problems/invert-binary-tree/', ARRAY['Tree', 'Depth-First Search', 'Breadth-First Search', 'Binary Tree']),
(230, 'Kth Smallest Element in a BST', 'Medium', 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/', ARRAY['Tree', 'Depth-First Search', 'Binary Search Tree', 'Binary Tree']),
(235, 'Lowest Common Ancestor of a Binary Search Tree', 'Medium', 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/', ARRAY['Tree', 'Depth-First Search', 'Binary Search Tree', 'Binary Tree']),
(236, 'Lowest Common Ancestor of a Binary Tree', 'Medium', 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/', ARRAY['Tree', 'Depth-First Search', 'Binary Tree']),
(238, 'Product of Array Except Self', 'Medium', 'https://leetcode.com/problems/product-of-array-except-self/', ARRAY['Array', 'Prefix Sum']),
(239, 'Sliding Window Maximum', 'Hard', 'https://leetcode.com/problems/sliding-window-maximum/', ARRAY['Array', 'Queue', 'Sliding Window', 'Heap', 'Monotonic Queue']),
(242, 'Valid Anagram', 'Easy', 'https://leetcode.com/problems/valid-anagram/', ARRAY['Hash Table', 'String', 'Sorting']),
(252, 'Meeting Rooms', 'Easy', 'https://leetcode.com/problems/meeting-rooms/', ARRAY['Array', 'Sorting']),
(253, 'Meeting Rooms II', 'Medium', 'https://leetcode.com/problems/meeting-rooms-ii/', ARRAY['Array', 'Two Pointers', 'Greedy', 'Sorting', 'Heap']),
(261, 'Graph Valid Tree', 'Medium', 'https://leetcode.com/problems/graph-valid-tree/', ARRAY['Depth-First Search', 'Breadth-First Search', 'Union Find', 'Graph']),
(268, 'Missing Number', 'Easy', 'https://leetcode.com/problems/missing-number/', ARRAY['Array', 'Hash Table', 'Math', 'Binary Search', 'Bit Manipulation', 'Sorting']),
(271, 'Encode and Decode Strings', 'Medium', 'https://leetcode.com/problems/encode-and-decode-strings/', ARRAY['Array', 'String', 'Design']),
(283, 'Move Zeroes', 'Easy', 'https://leetcode.com/problems/move-zeroes/', ARRAY['Array', 'Two Pointers']),
(286, 'Walls and Gates', 'Medium', 'https://leetcode.com/problems/walls-and-gates/', ARRAY['Array', 'Breadth-First Search', 'Matrix']),
(287, 'Find the Duplicate Number', 'Medium', 'https://leetcode.com/problems/find-the-duplicate-number/', ARRAY['Array', 'Two Pointers', 'Binary Search', 'Bit Manipulation']),
(295, 'Find Median from Data Stream', 'Hard', 'https://leetcode.com/problems/find-median-from-data-stream/', ARRAY['Two Pointers', 'Design', 'Sorting', 'Heap', 'Data Stream']),
(297, 'Serialize and Deserialize Binary Tree', 'Hard', 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/', ARRAY['String', 'Tree', 'Depth-First Search', 'Breadth-First Search', 'Design', 'Binary Tree']),
(300, 'Longest Increasing Subsequence', 'Medium', 'https://leetcode.com/problems/longest-increasing-subsequence/', ARRAY['Array', 'Binary Search', 'Dynamic Programming']),
(309, 'Best Time to Buy and Sell Stock with Cooldown', 'Medium', 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/', ARRAY['Array', 'Dynamic Programming']),
(312, 'Burst Balloons', 'Hard', 'https://leetcode.com/problems/burst-balloons/', ARRAY['Array', 'Dynamic Programming']),
(322, 'Coin Change', 'Medium', 'https://leetcode.com/problems/coin-change/', ARRAY['Array', 'Dynamic Programming', 'Breadth-First Search']),
(323, 'Number of Connected Components in an Undirected Graph', 'Medium', 'https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/', ARRAY['Depth-First Search', 'Breadth-First Search', 'Union Find', 'Graph']),
(328, 'Odd Even Linked List', 'Medium', 'https://leetcode.com/problems/odd-even-linked-list/', ARRAY['Linked List']),
(329, 'Longest Increasing Path in a Matrix', 'Hard', 'https://leetcode.com/problems/longest-increasing-path-in-a-matrix/', ARRAY['Array', 'Dynamic Programming', 'Depth-First Search', 'Breadth-First Search', 'Graph', 'Topological Sort', 'Memoization', 'Matrix']),
(332, 'Reconstruct Itinerary', 'Hard', 'https://leetcode.com/problems/reconstruct-itinerary/', ARRAY['Depth-First Search', 'Graph', 'Eulerian Circuit']),
(334, 'Increasing Triplet Subsequence', 'Medium', 'https://leetcode.com/problems/increasing-triplet-subsequence/', ARRAY['Array', 'Greedy']),
(338, 'Counting Bits', 'Easy', 'https://leetcode.com/problems/counting-bits/', ARRAY['Dynamic Programming', 'Bit Manipulation']),
(345, 'Reverse Vowels of a String', 'Easy', 'https://leetcode.com/problems/reverse-vowels-of-a-string/', ARRAY['Two Pointers', 'String']),
(347, 'Top K Frequent Elements', 'Medium', 'https://leetcode.com/problems/top-k-frequent-elements/', ARRAY['Array', 'Hash Table', 'Divide and Conquer', 'Sorting', 'Heap', 'Bucket Sort', 'Counting', 'Quickselect']),
(355, 'Design Twitter', 'Medium', 'https://leetcode.com/problems/design-twitter/', ARRAY['Hash Table', 'Linked List', 'Design', 'Heap']),
(371, 'Sum of Two Integers', 'Medium', 'https://leetcode.com/problems/sum-of-two-integers/', ARRAY['Math', 'Bit Manipulation']),
(374, 'Guess Number Higher or Lower', 'Easy', 'https://leetcode.com/problems/guess-number-higher-or-lower/', ARRAY['Binary Search', 'Interactive']),
(392, 'Is Subsequence', 'Easy', 'https://leetcode.com/problems/is-subsequence/', ARRAY['Two Pointers', 'String', 'Dynamic Programming']),
(394, 'Decode String', 'Medium', 'https://leetcode.com/problems/decode-string/', ARRAY['String', 'Stack', 'Recursion']),
(399, 'Evaluate Division', 'Medium', 'https://leetcode.com/problems/evaluate-division/', ARRAY['Array', 'Depth-First Search', 'Breadth-First Search', 'Union Find', 'Graph', 'Shortest Path']),
(416, 'Partition Equal Subset Sum', 'Medium', 'https://leetcode.com/problems/partition-equal-subset-sum/', ARRAY['Array', 'Dynamic Programming']),
(417, 'Pacific Atlantic Water Flow', 'Medium', 'https://leetcode.com/problems/pacific-atlantic-water-flow/', ARRAY['Array', 'Depth-First Search', 'Breadth-First Search', 'Matrix']),
(424, 'Longest Repeating Character Replacement', 'Medium', 'https://leetcode.com/problems/longest-repeating-character-replacement/', ARRAY['Hash Table', 'String', 'Sliding Window']),
(435, 'Non-overlapping Intervals', 'Medium', 'https://leetcode.com/problems/non-overlapping-intervals/', ARRAY['Array', 'Dynamic Programming', 'Greedy', 'Sorting']),
(437, 'Path Sum III', 'Medium', 'https://leetcode.com/problems/path-sum-iii/', ARRAY['Tree', 'Depth-First Search', 'Binary Tree']),
(443, 'String Compression', 'Medium', 'https://leetcode.com/problems/string-compression/', ARRAY['Two Pointers', 'String']),
(450, 'Delete Node in a BST', 'Medium', 'https://leetcode.com/problems/delete-node-in-a-bst/', ARRAY['Tree', 'Binary Search Tree', 'Binary Tree']),
(452, 'Minimum Number of Arrows to Burst Balloons', 'Medium', 'https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/', ARRAY['Array', 'Greedy', 'Sorting']),
(494, 'Target Sum', 'Medium', 'https://leetcode.com/problems/target-sum/', ARRAY['Array', 'Dynamic Programming', 'Backtracking']),
(518, 'Coin Change II', 'Medium', 'https://leetcode.com/problems/coin-change-ii/', ARRAY['Array', 'Dynamic Programming']),
(543, 'Diameter of Binary Tree', 'Easy', 'https://leetcode.com/problems/diameter-of-binary-tree/', ARRAY['Tree', 'Depth-First Search', 'Binary Tree']),
(547, 'Number of Provinces', 'Medium', 'https://leetcode.com/problems/number-of-provinces/', ARRAY['Depth-First Search', 'Breadth-First Search', 'Union Find', 'Graph']),
(567, 'Permutation in String', 'Medium', 'https://leetcode.com/problems/permutation-in-string/', ARRAY['Hash Table', 'Two Pointers', 'String', 'Sliding Window']),
(572, 'Subtree of Another Tree', 'Easy', 'https://leetcode.com/problems/subtree-of-another-tree/', ARRAY['Tree', 'Depth-First Search', 'String Matching', 'Binary Tree', 'Hash Function']),
(605, 'Can Place Flowers', 'Easy', 'https://leetcode.com/problems/can-place-flowers/', ARRAY['Array', 'Greedy']),
(621, 'Task Scheduler', 'Medium', 'https://leetcode.com/problems/task-scheduler/', ARRAY['Array', 'Hash Table', 'Greedy', 'Sorting', 'Heap', 'Counting']),
(643, 'Maximum Average Subarray I', 'Easy', 'https://leetcode.com/problems/maximum-average-subarray-i/', ARRAY['Array', 'Sliding Window']),
(647, 'Palindromic Substrings', 'Medium', 'https://leetcode.com/problems/palindromic-substrings/', ARRAY['String', 'Dynamic Programming']),
(649, 'Dota2 Senate', 'Medium', 'https://leetcode.com/problems/dota2-senate/', ARRAY['String', 'Greedy', 'Queue']),
(678, 'Valid Parenthesis String', 'Medium', 'https://leetcode.com/problems/valid-parenthesis-string/', ARRAY['String', 'Dynamic Programming', 'Stack', 'Greedy']),
(684, 'Redundant Connection', 'Medium', 'https://leetcode.com/problems/redundant-connection/', ARRAY['Depth-First Search', 'Breadth-First Search', 'Union Find', 'Graph']),
(695, 'Max Area of Island', 'Medium', 'https://leetcode.com/problems/max-area-of-island/', ARRAY['Array', 'Depth-First Search', 'Breadth-First Search', 'Union Find', 'Matrix']),
(700, 'Search in a Binary Search Tree', 'Easy', 'https://leetcode.com/problems/search-in-a-binary-search-tree/', ARRAY['Tree', 'Binary Search Tree', 'Binary Tree']),
(703, 'Kth Largest Element in a Stream', 'Easy', 'https://leetcode.com/problems/kth-largest-element-in-a-stream/', ARRAY['Tree', 'Design', 'Binary Search Tree', 'Heap', 'Binary Tree', 'Data Stream']),
(704, 'Binary Search', 'Easy', 'https://leetcode.com/problems/binary-search/', ARRAY['Array', 'Binary Search']),
(714, 'Best Time to Buy and Sell Stock with Transaction Fee', 'Medium', 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/', ARRAY['Array', 'Dynamic Programming', 'Greedy']),
(724, 'Find Pivot Index', 'Easy', 'https://leetcode.com/problems/find-pivot-index/', ARRAY['Array', 'Prefix Sum']),
(735, 'Asteroid Collision', 'Medium', 'https://leetcode.com/problems/asteroid-collision/', ARRAY['Array', 'Stack', 'Simulation']),
(739, 'Daily Temperatures', 'Medium', 'https://leetcode.com/problems/daily-temperatures/', ARRAY['Array', 'Stack', 'Monotonic Stack']),
(743, 'Network Delay Time', 'Medium', 'https://leetcode.com/problems/network-delay-time/', ARRAY['Depth-First Search', 'Breadth-First Search', 'Graph', 'Heap', 'Shortest Path']),
(746, 'Min Cost Climbing Stairs', 'Easy', 'https://leetcode.com/problems/min-cost-climbing-stairs/', ARRAY['Array', 'Dynamic Programming']),
(763, 'Partition Labels', 'Medium', 'https://leetcode.com/problems/partition-labels/', ARRAY['Hash Table', 'Two Pointers', 'String', 'Greedy']),
(778, 'Swim in Rising Water', 'Hard', 'https://leetcode.com/problems/swim-in-rising-water/', ARRAY['Array', 'Binary Search', 'Depth-First Search', 'Breadth-First Search', 'Union Find', 'Heap', 'Matrix']),
(787, 'Cheapest Flights Within K Stops', 'Medium', 'https://leetcode.com/problems/cheapest-flights-within-k-stops/', ARRAY['Dynamic Programming', 'Depth-First Search', 'Breadth-First Search', 'Graph', 'Heap', 'Shortest Path']),
(790, 'Domino and Tromino Tiling', 'Medium', 'https://leetcode.com/problems/domino-and-tromino-tiling/', ARRAY['Dynamic Programming']),
(841, 'Keys and Rooms', 'Medium', 'https://leetcode.com/problems/keys-and-rooms/', ARRAY['Depth-First Search', 'Breadth-First Search', 'Graph']),
(846, 'Hand of Straights', 'Medium', 'https://leetcode.com/problems/hand-of-straights/', ARRAY['Array', 'Hash Table', 'Greedy', 'Sorting']),
(853, 'Car Fleet', 'Medium', 'https://leetcode.com/problems/car-fleet/', ARRAY['Array', 'Stack', 'Sorting', 'Monotonic Stack']),
(872, 'Leaf-Similar Trees', 'Easy', 'https://leetcode.com/problems/leaf-similar-trees/', ARRAY['Tree', 'Depth-First Search', 'Binary Tree']),
(875, 'Koko Eating Bananas', 'Medium', 'https://leetcode.com/problems/koko-eating-bananas/', ARRAY['Array', 'Binary Search']),
(901, 'Online Stock Span', 'Medium', 'https://leetcode.com/problems/online-stock-span/', ARRAY['Stack', 'Design', 'Monotonic Stack', 'Data Stream']),
(933, 'Number of Recent Calls', 'Easy', 'https://leetcode.com/problems/number-of-recent-calls/', ARRAY['Design', 'Queue', 'Data Stream']),
(973, 'K Closest Points to Origin', 'Medium', 'https://leetcode.com/problems/k-closest-points-to-origin/', ARRAY['Array', 'Math', 'Divide and Conquer', 'Geometry', 'Sorting', 'Heap', 'Quickselect']),
(981, 'Time Based Key-Value Store', 'Medium', 'https://leetcode.com/problems/time-based-key-value-store/', ARRAY['Hash Table', 'String', 'Binary Search', 'Design']),
(994, 'Rotting Oranges', 'Medium', 'https://leetcode.com/problems/rotting-oranges/', ARRAY['Array', 'Breadth-First Search', 'Matrix']),
(1004, 'Max Consecutive Ones III', 'Medium', 'https://leetcode.com/problems/max-consecutive-ones-iii/', ARRAY['Array', 'Binary Search', 'Sliding Window', 'Prefix Sum']),
(1046, 'Last Stone Weight', 'Easy', 'https://leetcode.com/problems/last-stone-weight/', ARRAY['Array', 'Heap']),
(1071, 'Greatest Common Divisor of Strings', 'Easy', 'https://leetcode.com/problems/greatest-common-divisor-of-strings/', ARRAY['Math', 'String']),
(1137, 'N-th Tribonacci Number', 'Easy', 'https://leetcode.com/problems/n-th-tribonacci-number/', ARRAY['Math', 'Dynamic Programming', 'Memoization']),
(1143, 'Longest Common Subsequence', 'Medium', 'https://leetcode.com/problems/longest-common-subsequence/', ARRAY['String', 'Dynamic Programming']),
(1161, 'Maximum Level Sum of a Binary Tree', 'Medium', 'https://leetcode.com/problems/maximum-level-sum-of-a-binary-tree/', ARRAY['Tree', 'Depth-First Search', 'Breadth-First Search', 'Binary Tree']),
(1207, 'Unique Number of Occurrences', 'Easy', 'https://leetcode.com/problems/unique-number-of-occurrences/', ARRAY['Array', 'Hash Table']),
(1268, 'Search Suggestions System', 'Medium', 'https://leetcode.com/problems/search-suggestions-system/', ARRAY['Array', 'String', 'Binary Search', 'Trie', 'Sorting', 'Heap']),
(1318, 'Minimum Flips to Make a OR b Equal to c', 'Medium', 'https://leetcode.com/problems/minimum-flips-to-make-a-or-b-equal-to-c/', ARRAY['Bit Manipulation']),
(1372, 'Longest ZigZag Path in a Binary Tree', 'Medium', 'https://leetcode.com/problems/longest-zigzag-path-in-a-binary-tree/', ARRAY['Dynamic Programming', 'Tree', 'Depth-First Search', 'Binary Tree']),
(1431, 'Kids With the Greatest Number of Candies', 'Easy', 'https://leetcode.com/problems/kids-with-the-greatest-number-of-candies/', ARRAY['Array']),
(1448, 'Count Good Nodes in Binary Tree', 'Medium', 'https://leetcode.com/problems/count-good-nodes-in-binary-tree/', ARRAY['Tree', 'Depth-First Search', 'Breadth-First Search', 'Binary Tree']),
(1456, 'Maximum Number of Vowels in a Substring of Given Length', 'Medium', 'https://leetcode.com/problems/maximum-number-of-vowels-in-a-substring-of-given-length/', ARRAY['String', 'Sliding Window']),
(1466, 'Reorder Routes to Make All Paths Lead to the City Zero', 'Medium', 'https://leetcode.com/problems/reorder-routes-to-make-all-paths-lead-to-the-city-zero/', ARRAY['Depth-First Search', 'Breadth-First Search', 'Graph']),
(1493, 'Longest Subarray of 1''s After Deleting One Element', 'Medium', 'https://leetcode.com/problems/longest-subarray-of-1s-after-deleting-one-element/', ARRAY['Array', 'Dynamic Programming', 'Sliding Window']),
(1584, 'Min Cost to Connect All Points', 'Medium', 'https://leetcode.com/problems/min-cost-to-connect-all-points/', ARRAY['Array', 'Union Find', 'Graph', 'Minimum Spanning Tree']),
(1631, 'Path With Minimum Effort', 'Medium', 'https://leetcode.com/problems/path-with-minimum-effort/', ARRAY['Array', 'Binary Search', 'Depth-First Search', 'Breadth-First Search', 'Union Find', 'Heap', 'Matrix']),
(1657, 'Determine if Two Strings Are Close', 'Medium', 'https://leetcode.com/problems/determine-if-two-strings-are-close/', ARRAY['Hash Table', 'String', 'Sorting', 'Counting']),
(1679, 'Max Number of K-Sum Pairs', 'Medium', 'https://leetcode.com/problems/max-number-of-k-sum-pairs/', ARRAY['Array', 'Hash Table', 'Two Pointers', 'Sorting']),
(1732, 'Find the Highest Altitude', 'Easy', 'https://leetcode.com/problems/find-the-highest-altitude/', ARRAY['Array', 'Prefix Sum']),
(1768, 'Merge Strings Alternately', 'Easy', 'https://leetcode.com/problems/merge-strings-alternately/', ARRAY['Two Pointers', 'String']),
(1851, 'Minimum Interval to Include Each Query', 'Hard', 'https://leetcode.com/problems/minimum-interval-to-include-each-query/', ARRAY['Array', 'Binary Search', 'Line Sweep', 'Sorting', 'Heap']),
(1899, 'Merge Triplets to Form Target Triplet', 'Medium', 'https://leetcode.com/problems/merge-triplets-to-form-target-triplet/', ARRAY['Array', 'Greedy']),
(1926, 'Nearest Exit from Entrance in Maze', 'Medium', 'https://leetcode.com/problems/nearest-exit-from-entrance-in-maze/', ARRAY['Array', 'Breadth-First Search', 'Matrix']),
(2013, 'Detect Squares', 'Medium', 'https://leetcode.com/problems/detect-squares/', ARRAY['Array', 'Hash Table', 'Design', 'Counting']),
(2095, 'Delete the Middle Node of a Linked List', 'Medium', 'https://leetcode.com/problems/delete-the-middle-node-of-a-linked-list/', ARRAY['Linked List', 'Two Pointers']),
(2130, 'Maximum Twin Sum of a Linked List', 'Medium', 'https://leetcode.com/problems/maximum-twin-sum-of-a-linked-list/', ARRAY['Linked List', 'Two Pointers', 'Stack']),
(2215, 'Find the Difference of Two Arrays', 'Easy', 'https://leetcode.com/problems/find-the-difference-of-two-arrays/', ARRAY['Array', 'Hash Table']),
(2300, 'Successful Pairs of Spells and Potions', 'Medium', 'https://leetcode.com/problems/successful-pairs-of-spells-and-potions/', ARRAY['Array', 'Two Pointers', 'Binary Search', 'Sorting']),
(2336, 'Smallest Number in Infinite Set', 'Medium', 'https://leetcode.com/problems/smallest-number-in-infinite-set/', ARRAY['Hash Table', 'Design', 'Heap']),
(2352, 'Equal Row and Column Pairs', 'Medium', 'https://leetcode.com/problems/equal-row-and-column-pairs/', ARRAY['Array', 'Hash Table', 'Matrix', 'Simulation']),
(2390, 'Removing Stars From a String', 'Medium', 'https://leetcode.com/problems/removing-stars-from-a-string/', ARRAY['String', 'Stack', 'Simulation']),
(2462, 'Total Cost to Hire K Workers', 'Medium', 'https://leetcode.com/problems/total-cost-to-hire-k-workers/', ARRAY['Array', 'Two Pointers', 'Heap', 'Simulation']),
(2542, 'Maximum Subsequence Score', 'Medium', 'https://leetcode.com/problems/maximum-subsequence-score/', ARRAY['Array', 'Greedy', 'Sorting', 'Heap'])
ON CONFLICT (leetcode_id) DO NOTHING;

-- Now link problems to NeetCode 150 set (preserving NeetCode curriculum order)
-- First, delete any existing NeetCode 150 items if re-running
DELETE FROM problem_set_items
WHERE problem_set_id = (SELECT id FROM problem_sets WHERE name = 'NeetCode 150');

-- Insert with explicit sort_order matching neetcode-150.json array index
INSERT INTO problem_set_items (problem_set_id, problem_id, sort_order)
SELECT
  (SELECT id FROM problem_sets WHERE name = 'NeetCode 150'),
  p.id,
  o.sort_order
FROM (VALUES
  -- Arrays & Hashing (0-8)
  (217, 0), (242, 1), (1, 2), (49, 3), (347, 4), (238, 5), (36, 6), (271, 7), (128, 8),
  -- Two Pointers (9-13)
  (125, 9), (167, 10), (15, 11), (11, 12), (42, 13),
  -- Sliding Window (14-19)
  (121, 14), (3, 15), (424, 16), (567, 17), (76, 18), (239, 19),
  -- Stack (20-26)
  (20, 20), (155, 21), (150, 22), (22, 23), (739, 24), (853, 25), (84, 26),
  -- Binary Search (27-33)
  (704, 27), (74, 28), (875, 29), (153, 30), (33, 31), (981, 32), (4, 33),
  -- Linked List (34-44)
  (206, 34), (21, 35), (143, 36), (19, 37), (138, 38), (2, 39), (141, 40), (287, 41), (146, 42), (23, 43), (25, 44),
  -- Trees (45-59)
  (226, 45), (104, 46), (543, 47), (110, 48), (100, 49), (572, 50), (235, 51), (102, 52), (199, 53), (1448, 54), (98, 55), (230, 56), (105, 57), (124, 58), (297, 59),
  -- Tries (60-62)
  (208, 60), (211, 61), (212, 62),
  -- Heap / Priority Queue (63-69)
  (703, 63), (1046, 64), (973, 65), (215, 66), (621, 67), (355, 68), (295, 69),
  -- Backtracking (70-78)
  (78, 70), (39, 71), (46, 72), (90, 73), (40, 74), (79, 75), (131, 76), (17, 77), (51, 78),
  -- Graphs (79-91)
  (200, 79), (133, 80), (695, 81), (417, 82), (130, 83), (994, 84), (286, 85), (207, 86), (210, 87), (684, 88), (323, 89), (261, 90), (127, 91),
  -- Advanced Graphs (92-97)
  (743, 92), (1631, 93), (787, 94), (332, 95), (1584, 96), (778, 97),
  -- 1-D Dynamic Programming (98-109)
  (70, 98), (746, 99), (198, 100), (213, 101), (5, 102), (647, 103), (91, 104), (322, 105), (152, 106), (139, 107), (300, 108), (416, 109),
  -- 2-D Dynamic Programming (110-120)
  (62, 110), (1143, 111), (309, 112), (518, 113), (494, 114), (97, 115), (329, 116), (115, 117), (72, 118), (312, 119), (10, 120),
  -- Greedy (121-128)
  (53, 121), (55, 122), (45, 123), (134, 124), (846, 125), (1899, 126), (763, 127), (678, 128),
  -- Intervals (129-134)
  (57, 129), (56, 130), (435, 131), (252, 132), (253, 133), (1851, 134),
  -- Math & Geometry (135-142)
  (48, 135), (54, 136), (73, 137), (202, 138), (66, 139), (50, 140), (43, 141), (2013, 142),
  -- Bit Manipulation (143-149)
  (136, 143), (191, 144), (338, 145), (190, 146), (268, 147), (371, 148), (7, 149)
) AS o(leetcode_id, sort_order)
JOIN problems p ON p.leetcode_id = o.leetcode_id
ON CONFLICT (problem_set_id, problem_id) DO UPDATE SET sort_order = EXCLUDED.sort_order;

-- Link problems to LeetCode 75 set (preserving LeetCode 75 curriculum order)
-- First, delete any existing LeetCode 75 items if re-running
DELETE FROM problem_set_items
WHERE problem_set_id = (SELECT id FROM problem_sets WHERE name = 'LeetCode 75');

-- Insert with explicit sort_order matching leetcode-75.json array index
INSERT INTO problem_set_items (problem_set_id, problem_id, sort_order)
SELECT
  (SELECT id FROM problem_sets WHERE name = 'LeetCode 75'),
  p.id,
  o.sort_order
FROM (VALUES
  -- Array / String (0-8)
  (1768, 0), (1071, 1), (1431, 2), (605, 3), (345, 4), (151, 5), (238, 6), (334, 7), (443, 8),
  -- Two Pointers (9-12)
  (283, 9), (392, 10), (11, 11), (1679, 12),
  -- Sliding Window (13-16)
  (643, 13), (1456, 14), (1004, 15), (1493, 16),
  -- Prefix Sum (17-18)
  (1732, 17), (724, 18),
  -- Hash Map / Set (19-22)
  (2215, 19), (1207, 20), (1657, 21), (2352, 22),
  -- Stack (23-25)
  (2390, 23), (735, 24), (394, 25),
  -- Queue (26-27)
  (933, 26), (649, 27),
  -- Linked List (28-31)
  (2095, 28), (328, 29), (206, 30), (2130, 31),
  -- Binary Tree - DFS (32-37)
  (104, 32), (872, 33), (1448, 34), (437, 35), (1372, 36), (236, 37),
  -- Binary Tree - BFS (38-39)
  (199, 38), (1161, 39),
  -- Binary Search Tree (40-41)
  (700, 40), (450, 41),
  -- Graphs - DFS (42-45)
  (841, 42), (547, 43), (1466, 44), (399, 45),
  -- Graphs - BFS (46-47)
  (1926, 46), (994, 47),
  -- Heap / Priority Queue (48-51)
  (215, 48), (2336, 49), (2542, 50), (2462, 51),
  -- Binary Search (52-55)
  (374, 52), (2300, 53), (162, 54), (875, 55),
  -- Backtracking (56-57)
  (17, 56), (216, 57),
  -- DP - 1D (58-61)
  (1137, 58), (746, 59), (198, 60), (790, 61),
  -- DP - Multidimensional (62-65)
  (62, 62), (1143, 63), (714, 64), (72, 65),
  -- Bit Manipulation (66-68)
  (136, 66), (1318, 67), (338, 68),
  -- Trie (69-70)
  (208, 69), (1268, 70),
  -- Intervals (71-72)
  (435, 71), (452, 72),
  -- Monotonic Stack (73-74)
  (739, 73), (901, 74)
) AS o(leetcode_id, sort_order)
JOIN problems p ON p.leetcode_id = o.leetcode_id
ON CONFLICT (problem_set_id, problem_id) DO UPDATE SET sort_order = EXCLUDED.sort_order;

-- Verify the results
SELECT ps.name, COUNT(psi.id) as problem_count
FROM problem_sets ps
LEFT JOIN problem_set_items psi ON ps.id = psi.problem_set_id
GROUP BY ps.id, ps.name;
