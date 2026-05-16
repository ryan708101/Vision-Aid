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

//API to update user's accuracy of a challenge and mark challenge completed
const handleChallengeCompletion = async (req, res) => {
    const { 
        accuracy, 
        week, 
        day, 
        curWeek, 
        curChallenge, 
        nextWeek, 
        nextChallenge, 
        date 
    } = req.body;
    
    try {
        const user = await userModel.findOne({ _id: req.body.userId });
        if (!user) {
            return res.json({ success: false, message: "User Not Found!" });
        }

        // Update user's scores
        if (!user.scores[week]) {
            user.scores[week] = [];
        }
        user.scores[week][day] = accuracy;

        // Add activity date
        const existingActivity = user.activityDates.find(
            activity => 
                activity.date === date && 
                activity.weekNo === curWeek && 
                activity.challengeNo === curChallenge
        );

        if (!existingActivity) {
            user.activityDates.push({
                date,
                weekNo: curWeek,
                challengeNo: curChallenge
            });
        }

        // Update progress
        user.curWeek = nextWeek;
        user.curChallenge = nextChallenge;

        // Check for consecutive completion badge
        const weekActivities = user.activityDates
            .filter(activity => activity.weekNo === curWeek)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        const isConsecutive = weekActivities.every((_, index, arr) => {
            if (index === 0) return true;
            const prevDate = new Date(arr[index - 1].date);
            const currentDate = new Date(arr[index].date);
            const differenceInDays = (currentDate - prevDate) / (1000 * 60 * 60 * 24);
            return differenceInDays === 1;
        });

        if (isConsecutive && weekActivities.length === 7) {
            if (!user.badges) user.badges = [];
            user.badges[curWeek - 1] = true;
        }

        await user.save();
        
        return res.json({ 
            success: true, 
            message: "Challenge completion handled successfully" 
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

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


//API to forge data for sample purpose
const forgeData = async (req, res) => {
    const randomScore = () => Math.random() * 20.0 + 80.0;

    const initializeScores = (week, challenge) => {
        const scores = Array.from({ length: 7 }, () => Array(7).fill(0.0));
        for (let i = 0; i < week; i++) {
            for (let j = 0; j <= (i === week-1 ? challenge - 2 : 6); j++) {
                scores[i][j] = randomScore();
            }
        }
        return scores;
    };

    const generateActivityDates = (startDate, weeks = 7, challengesPerWeek = 7) => {
        const dates = [];
        const currentDate = new Date(startDate);

        for (let week = 1; week <= 4; week++) {
            for (let challenge = 1; challenge <= (week == 4 ? 1 : 7); challenge++) {
                dates.push({
                    date: new Date(currentDate).toISOString(),
                    challengeNo: challenge,
                    weekNo: week,
                });
                if (week == 1 && challenge == 5) currentDate.setDate(currentDate.getDate() + 3);
                else currentDate.setDate(currentDate.getDate() + 1);
            }
        }
        return dates;
    };

    const checkAndUpdateBadges = (activityDates) => {
        const badges = Array(7).fill(false);
        
        // Group activities by week
        const activitiesByWeek = {};
        activityDates.forEach(activity => {
            if (!activitiesByWeek[activity.weekNo]) {
                activitiesByWeek[activity.weekNo] = [];
            }
            activitiesByWeek[activity.weekNo].push(activity);
        });

        // Check each week for consecutive completions
        Object.entries(activitiesByWeek).forEach(([weekNo, weekActivities]) => {
            // Sort dates to check for consecutive streak
            weekActivities.sort((a, b) => new Date(a.date) - new Date(b.date));
            
            // Check if all 7 challenges were completed
            if (weekActivities.length === 7) {
                // Check for consecutive dates
                const isConsecutive = weekActivities.every((_, index, arr) => {
                    if (index === 0) return true;
                    const prevDate = new Date(arr[index - 1].date);
                    const currentDate = new Date(arr[index].date);
                    const differenceInDays = (currentDate - prevDate) / (1000 * 60 * 60 * 24);
                    return differenceInDays === 1;
                });

                if (isConsecutive) {
                    badges[parseInt(weekNo) - 1] = true;
                }
            }
        });

        return badges;
    };

    const {userId} = req.body;
    const activityDates = generateActivityDates("2024-11-19T13:19:13.186Z");
    const scores = initializeScores(4,2);
    const badges = checkAndUpdateBadges(activityDates);
    
    try {
        await userModel.findByIdAndUpdate(
            userId, 
            {
                activityDates, 
                scores, 
                curChallenge: 2, 
                curWeek: 4, 
                date: "2024-11-20T13:19:13.186Z",
                badges
            }
        );
        return res.json({success: true, message: 'Data forged Successfully!'})
    } catch (error) {
        return res.json({success: false, message: 'Data could not be forged!'})
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


export {registerUser, loginUser, getUser, handleChallengeCompletion, updateProfile, forgeData, updateDetectedDisease, handleGameCompletion}