import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import {v2 as cloudinary} from 'cloudinary';


//API to register user
const registerUser = async (req, res) => {
    
    try {
        const {fullName, email, password} = req.body;
        
        if(!fullName || !email || !password){
            return res.json({success:false, message:'Missing Details'});
        }

        if(!validator.isEmail(email)){
            return res.json({success:false, message:'Enter a valid email'});
        }

        if(password.length < 8){
            return res.json({success:false, message:'Enter a strong password'});
        }

        //hashing user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        //Splitting user name
        const firstName = fullName.split(" ")[0]
        const lastName = fullName.split(" ")[1];

        const userData = {
            firstName,
            lastName,
            email,
            password: hashedPassword
        }

        const newUser = new userModel(userData);
        const user = await newUser.save();

        const token = jwt.sign({id:user._id}, process.env.JWT_SECRET);
        res.json({success:true, token});

    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message})
    }
}

//API for user login
const loginUser = async (req, res) => {
    
    try {
        
        const {email, password} = req.body;
        const user = await userModel.findOne({email});

        if(!user){
            return res.json({success:false, message:"User does not exist"})
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(isMatch){
            const token = jwt.sign({id:user._id}, process.env.JWT_SECRET);
            res.json({success:true, token});
        }
        else{
            res.json({success:false, message:"Invalid Credentials"})
        }

    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message})
    }
}

//API to get user details
const getUser = async (req, res) => {
    const {userId} = req.body;
    const user = await userModel.findOne({_id: userId});
    if (!user){
        return res.json({success: false, message: "User not found"})
    }
    else{
        return res.json({success: true, message: user})
    }
}

//API to update user's profile
const updateProfile = async (req, res) => {
    try {
       
        const {firstName, lastName, email, phone, detectedDisease, userId} = req.body;
        const imageFile = req.file;

        // if(!firstName || !lastName || !email || !phone || !diagnosed){
        //     return res.json({success:false, message:'Data missing'})
        // }

        await userModel.findByIdAndUpdate(userId, {firstName, lastName, email, phone, detectedDisease});

        if(imageFile){

            //Upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type:'image'});
            const imageURL = imageUpload.secure_url;

            await userModel.findByIdAndUpdate(userId, {photo:imageURL});
        }

        res.json({success:true, message:'Profile Updated'});
        
    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message})
    }
}

// Update detected disease
const updateDetectedDisease = async (req, res) => {
  try {
    const { detectedDisease, userId } = req.body;
    console.log(userId, detectedDisease);

    if (!detectedDisease) {
      return res.json({ success: false, message: 'Disease name is required' });
    }

    const user = await userModel.findByIdAndUpdate(
      userId,
      { detectedDisease },
      { new: true }
    );

    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Disease updated successfully',
      detectedDisease: user.detectedDisease
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Handle game completion
const handleGameCompletion = async (req, res) => {
  try {
    const userId = req.body.userId;
    const { 
      score, 
      week, 
      day, 
      curWeek, 
      curChallenge, 
      nextWeek, 
      nextChallenge,
      lastPlayedDate,
      date 
    } = req.body;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: 'User not found broooo' });
    }

    // Update score if it's higher than existing
    if (Number(score) > user.scores[week][day]) {
      user.scores[week][day] = Number(score);
    }

    // Update progress if score >= 80
    if (score >= 80) {
      user.curWeek = nextWeek;
      user.curChallenge = nextChallenge;
    }

    // Update last played date
    user.lastPlayedDate = new Date(lastPlayedDate);

    // Add activity date (avoid duplicates)
    const existingActivity = user.activityDates.find(
      (activity) =>
        new Date(activity.date).toISOString().split('T')[0] === date.split('T')[0] &&
        activity.weekNo === curWeek &&
        activity.challengeNo === curChallenge
    );

    if (!existingActivity) {
      user.activityDates.push({
        date: new Date(date),
        weekNo: curWeek,
        challengeNo: curChallenge,
      });
    }

    // Check for badge completion (7 consecutive days in a week)
    const weekActivities = user.activityDates.filter(
      (activity) => activity.weekNo === curWeek
    );

    weekActivities.sort((a, b) => new Date(a.date) - new Date(b.date));

    const isConsecutive = weekActivities.every((_, index, arr) => {
      if (index === 0) return true;
      const prevDate = new Date(arr[index - 1].date);
      const currentDate = new Date(arr[index].date);
      const differenceInDays = (currentDate - prevDate) / (1000 * 60 * 60 * 24);
      return differenceInDays === 1;
    });

    if (isConsecutive && weekActivities.length === 7) {
      user.badges[curWeek - 1] = true;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Game completion recorded successfully',
      updatedUser: {
        scores: user.scores,
        curWeek: user.curWeek,
        curChallenge: user.curChallenge,
        lastPlayedDate: user.lastPlayedDate,
        activityDates: user.activityDates,
        badges: user.badges
      }
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


// Forge fake data for testing - Now simulates actual game completions
const forgeUserData = async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    // Reset user data first
    user.scores = Array.from({ length: 4 }, () => Array(7).fill(0));
    user.curWeek = 1;
    user.curChallenge = 1;
    user.activityDates = [];
    user.badges = [false, false, false, false];
    user.lastPlayedDate = null;

    await user.save();

    // Helper function to simulate game completion
    const simulateGameCompletion = async (weekNo, challengeNo, score, daysAgo) => {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      date.setHours(0, 0, 0, 0); // Normalize to midnight

      const week = weekNo - 1;
      const day = challengeNo - 1;

      // Update score if higher
      if (Number(score) > user.scores[week][day]) {
        user.scores[week][day] = Number(score);
      }

      // Update progress if score >= 80
      if (score >= 80) {
        if (challengeNo === 7) {
          if (weekNo < 4) {
            user.curWeek = weekNo + 1;
            user.curChallenge = 1;
          }
        } else {
          user.curWeek = weekNo;
          user.curChallenge = challengeNo + 1;
        }
      }

      // Update last played date
      user.lastPlayedDate = date.getDate();

      // Add activity date (avoid duplicates)
      const dateStr = date.toISOString().split('T')[0];
      const existingActivity = user.activityDates.find(
        (activity) =>
          new Date(activity.date).toISOString().split('T')[0] === dateStr &&
          activity.weekNo === weekNo &&
          activity.challengeNo === challengeNo
      );

      if (!existingActivity) {
        user.activityDates.push({
          date: date,
          weekNo: weekNo,
          challengeNo: challengeNo,
        });
      }

      // Check for badge completion (7 consecutive days in a week)
      const weekActivities = user.activityDates.filter(
        (activity) => activity.weekNo === weekNo
      );

      weekActivities.sort((a, b) => new Date(a.date) - new Date(b.date));

      const isConsecutive = weekActivities.every((_, index, arr) => {
        if (index === 0) return true;
        const prevDate = new Date(arr[index - 1].date);
        const currentDate = new Date(arr[index].date);
        const differenceInDays = (currentDate - prevDate) / (1000 * 60 * 60 * 24);
        return differenceInDays === 1;
      });

      if (isConsecutive && weekActivities.length === 7) {
        user.badges[weekNo - 1] = true;
      }
    };

    // === WEEK 1: 7 CONSECUTIVE DAYS (should earn badge) ===
    await simulateGameCompletion(1, 1, 85, 20); // 20 days ago
    await simulateGameCompletion(1, 2, 92, 19); // 19 days ago
    await simulateGameCompletion(1, 3, 88, 18); // 18 days ago
    await simulateGameCompletion(1, 4, 95, 17); // 17 days ago
    await simulateGameCompletion(1, 5, 90, 16); // 16 days ago
    await simulateGameCompletion(1, 6, 87, 15); // 15 days ago
    await simulateGameCompletion(1, 7, 93, 14); // 14 days ago - Week 1 complete!

    // === WEEK 2: WITH GAPS (should NOT earn badge) ===
    await simulateGameCompletion(2, 1, 84, 13); // 13 days ago
    await simulateGameCompletion(2, 2, 86, 12); // 12 days ago
    // GAP HERE - skipped day 11
    await simulateGameCompletion(2, 3, 89, 10); // 10 days ago
    await simulateGameCompletion(2, 4, 91, 9);  // 9 days ago
    // GAP HERE - skipped day 8
    await simulateGameCompletion(2, 5, 87, 7);  // 7 days ago
    await simulateGameCompletion(2, 6, 90, 6);  // 6 days ago
    await simulateGameCompletion(2, 7, 88, 5);  // 5 days ago - Week 2 complete!

    // === WEEK 3: IN PROGRESS (1 challenge done) ===
    await simulateGameCompletion(3, 1, 92, 4);  // 4 days ago



    // Calculate the number of milliseconds in 100 days
    // 100 days * 24 hours/day * 60 minutes/hour * 60 seconds/minute * 1000 milliseconds/second
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const millisecondsIn100Days = 100 * millisecondsPerDay;

    // Get the current timestamp (milliseconds since the epoch)
    const nowTimestamp = Date.now();

    // Calculate the timestamp from 100 days ago
    const pastTimestamp = nowTimestamp - millisecondsIn100Days;

    // Create a new Date object using the past timestamp
    user.date = new Date(pastTimestamp);
    // Save all changes
    await user.save();

    // Prepare summary message
    const summaryMessage = `
Test Data Generated:
- Week 1: ✅ Completed (7 consecutive days) - Badge: ${user.badges[0] ? '🏆 Earned' : '❌ Not Earned'}
- Week 2: ✅ Completed (WITH GAPS) - Badge: ${user.badges[1] ? '🏆 Earned' : '❌ Not Earned'}
- Week 3: 🔄 In Progress (1/7 challenges)
- Current Position: Week ${user.curWeek}, Challenge ${user.curChallenge}
- Total Activities: ${user.activityDates.length}
    `.trim();

    console.log(summaryMessage);

    res.json({
      success: true,
      message: 'Test data generated and processed through game completion logic',
      summary: summaryMessage,
      forgedUser: {
        scores: user.scores,
        curWeek: user.curWeek,
        curChallenge: user.curChallenge,
        activityDates: user.activityDates,
        badges: user.badges,
        lastPlayedDate: user.lastPlayedDate
      }
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


export {registerUser, loginUser, getUser, updateProfile, updateDetectedDisease, handleGameCompletion, forgeUserData}