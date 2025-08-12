# Phase 3 AI Integration Testing Guide

## 🎯 **Quick Start Testing**

### **Prerequisites**
1. Make sure your Convex dev server is running: `npx convex dev`
2. Ensure you have Google Gemini API key in your environment variables
3. Seed the database first: `api.seed.seedDatabase`

---

## 🧪 **Testing Methods**

### **Method 1: Convex Dashboard (Recommended)**

#### **Step 1: Seed Database**
```json
// Function: api.seed.seedDatabase
// Arguments: {}
{
}
```

#### **Step 2: Test AI Drill Generation**
```json
// Function: api.ai.generateAndStoreDrill
// Arguments: {
  "skillId": "jh7fpzm8yhw5z9wkw23mq7gcxs7n5mtn",
  "category": "shooting",
  "difficulty": "Intermediate",
  "userId": "user_2abc123def456"
}
```

**Expected Response:**
```json
{
  "success": true,
  "drill": {
    "_id": "generated_drill_id",
    "_creationTime": 1234567890,
    "skillId": "jh7fpzm8yhw5z9wkw23mq7gcxs7n5mtn",
    "category": "shooting",
    "difficulty": "Intermediate",
    "description": "AI-generated drill description...",
    "createdAt": 1234567890,
    "createdBy": "user_2abc123def456"
  }
}
```

#### **Step 3: Test Daily Drill**
```json
// Function: api.ai.getDailyDrill
// Arguments: {
  "userId": "user_2abc123def456"
}
```

**Expected Response:**
```json
{
  "success": true,
  "drill": {
    "_id": "drill_id",
    "_creationTime": 1234567890,
    "skillId": "jh7fpzm8yhw5z9wkw23mq7gcxs7n5mtn",
    "category": "shooting",
    "difficulty": "Intermediate",
    "description": "Daily drill description...",
    "createdAt": 1234567890,
    "createdBy": "user_2abc123def456",
    "skill": {
      "_id": "jh7fpzm8yhw5z9wkw23mq7gcxs7n5mtn",
      "_creationTime": 1234567890,
      "name": "Basketball",
      "categories": ["shooting", "dribbling", "defense"],
      "public": true,
      "createdAt": 1234567890
    }
  },
  "analysis": {
    "currentLevel": "Intermediate",
    "recommendedDifficulty": "Intermediate",
    "focusAreas": ["shooting", "dribbling"]
  }
}
```

#### **Step 4: Test Skill Categories**
```json
// Function: api.ai.getSkillCategories
// Arguments: {
  "skillId": "jh7fpzm8yhw5z9wkw23mq7gcxs7n5mtn"
}
```

**Expected Response:**
```json
{
  "skillName": "Basketball",
  "categories": ["shooting", "dribbling", "defense", "passing", "rebounding"],
  "categoryStats": [
    {
      "category": "shooting",
      "drillCount": 3,
      "sessionsCount": 5
    },
    {
      "category": "dribbling",
      "drillCount": 2,
      "sessionsCount": 3
    }
  ]
}
```

#### **Step 5: Test Progress Analysis**
```json
// Function: api.ai.analyzeUserProgress
// Arguments: {
  "userId": "user_2abc123def456",
  "skillId": "jh7fpzm8yhw5z9wkw23mq7gcxs7n5mtn"
}
```

**Expected Response:**
```json
{
  "success": true,
  "analysis": {
    "currentLevel": "Intermediate",
    "recommendedDifficulty": "Intermediate",
    "focusAreas": ["shooting", "dribbling"],
    "suggestedDrill": "AI-generated drill description...",
    "progressStats": {
      "totalSessions": 8,
      "averageSessionsPerWeek": 2,
      "mostPracticedCategory": "shooting",
      "difficultyProgression": {
        "Beginner": 3,
        "Intermediate": 4,
        "Advanced": 1
      }
    }
  }
}
```

---

### **Method 2: CLI Testing**

```bash
# Navigate to backend directory
cd packages/backend

# Test Phase 3 operations
npx convex run api.test.testPhase3Operations --userId "user_2abc123def456" --skillId "jh7fpzm8yhw5z9wkw23mq7gcxs7n5mtn"

# Test AI drill generation
npx convex run api.ai.generateAndStoreDrill --skillId "jh7fpzm8yhw5z9wkw23mq7gcxs7n5mtn" --category "shooting" --difficulty "Intermediate" --userId "user_2abc123def456"

# Test daily drill
npx convex run api.ai.getDailyDrill --userId "user_2abc123def456"

# Test skill categories
npx convex run api.ai.getSkillCategories --skillId "jh7fpzm8yhw5z9wkw23mq7gcxs7n5mtn"

# Test progress analysis
npx convex run api.ai.analyzeUserProgress --userId "user_2abc123def456" --skillId "jh7fpzm8yhw5z9wkw23mq7gcxs7n5mtn"
```

---

### **Method 3: Frontend Integration**

#### **React Component Example**
```typescript
import { useAction, useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { useState } from "react";

export function AITestingComponent() {
  const [userId] = useState("user_2abc123def456");
  const [skillId] = useState("jh7fpzm8yhw5z9wkw23mq7gcxs7n5mtn");

  // AI Actions
  const generateDrill = useAction(api.ai.generateAndStoreDrill);
  const getDailyDrill = useAction(api.ai.getDailyDrill);
  const analyzeProgress = useAction(api.ai.analyzeUserProgress);

  // Queries
  const categories = useQuery(api.ai.getSkillCategories, { skillId });

  const handleGenerateDrill = async () => {
    try {
      const result = await generateDrill({
        skillId,
        category: "shooting",
        difficulty: "Intermediate",
        userId,
      });
      console.log("Generated drill:", result);
    } catch (error) {
      console.error("Error generating drill:", error);
    }
  };

  const handleGetDailyDrill = async () => {
    try {
      const result = await getDailyDrill({ userId });
      console.log("Daily drill:", result);
    } catch (error) {
      console.error("Error getting daily drill:", error);
    }
  };

  const handleAnalyzeProgress = async () => {
    try {
      const result = await analyzeProgress({ userId, skillId });
      console.log("Progress analysis:", result);
    } catch (error) {
      console.error("Error analyzing progress:", error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">AI Integration Testing</h2>
      
      <div className="space-y-4">
        <button
          onClick={handleGenerateDrill}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Generate AI Drill
        </button>

        <button
          onClick={handleGetDailyDrill}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Get Daily Drill
        </button>

        <button
          onClick={handleAnalyzeProgress}
          className="bg-purple-500 text-white px-4 py-2 rounded"
        >
          Analyze Progress
        </button>

        {categories && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Skill Categories</h3>
            <pre className="bg-gray-100 p-2 rounded">
              {JSON.stringify(categories, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 🎯 **Testing Checklist**

### **Phase 3 Functions to Test**

- [ ] **`api.seed.seedDatabase`** - Seed the database with sample data
- [ ] **`api.ai.generateAndStoreDrill`** - Generate AI-powered drills
- [ ] **`api.ai.getDailyDrill`** - Get personalized daily recommendations
- [ ] **`api.ai.getSkillCategories`** - Retrieve skill categories with stats
- [ ] **`api.ai.analyzeUserProgress`** - Analyze user progress and get insights
- [ ] **`api.ai.generateDrillVariations`** - Generate multiple drill variations
- [ ] **`api.test.testPhase3Operations`** - Test all Phase 3 operations

### **Expected Behaviors**

1. **AI Drill Generation**: Should create realistic, contextual drills
2. **Daily Recommendations**: Should consider user history and progress
3. **Progress Analysis**: Should provide meaningful insights and suggestions
4. **Category Management**: Should show comprehensive statistics
5. **Error Handling**: Should gracefully handle missing data or API errors

---

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Google Gemini API Key Missing**
- Ensure `GOOGLE_GEMINI_API_KEY` is set in your environment variables
   - Check Convex dashboard for environment variables

2. **Function Not Found**
   - Make sure Convex dev server is running
   - Check function names and paths

3. **Type Errors**
   - Ensure all TypeScript types are correct
   - Check function signatures and return types

4. **Database Errors**
   - Seed the database first with `api.seed.seedDatabase`
   - Check if required data exists

### **Debug Tips**

1. **Check Convex Dashboard Logs** for detailed error messages
2. **Use console.log** in your functions for debugging
3. **Test with simple data first** before complex scenarios
4. **Verify environment variables** are properly configured

---

## 🎯 **Success Indicators**

### **When Testing is Successful**

1. ✅ **AI Drill Generation** returns realistic, contextual drill descriptions
2. ✅ **Daily Drill** provides personalized recommendations based on user history
3. ✅ **Progress Analysis** shows meaningful insights and suggestions
4. ✅ **Skill Categories** displays comprehensive statistics
5. ✅ **Error Handling** gracefully manages edge cases
6. ✅ **Performance** responds within reasonable time limits

### **Next Steps After Testing**

1. **Integrate into Frontend** - Use the functions in your React components
2. **Add Error Handling** - Implement proper error states in UI
3. **Optimize Performance** - Add caching and loading states
4. **User Experience** - Create intuitive UI for AI features
5. **Monitoring** - Add analytics and usage tracking 