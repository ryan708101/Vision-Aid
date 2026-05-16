import { assets } from '@/assets/assets';
import ActivityGrid from '@/components/ActivityGrid';
import AnimatedCircularProgressBar from '@/components/ui/animated-circular-progress-bar';
import { clearToken, getUser, setUser, updateProfile, updateSelectedWeek } from '@/redux/userSlice';
import { useSelector, useDispatch } from 'react-redux';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { Chart, registerables } from 'chart.js';
import { useNavigate } from 'react-router-dom';

// Register all chart components
Chart.register(...registerables);

const MyProfile = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const navigate = useNavigate();

  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(null);

  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  /* ==================================================================
     HANDLE PROFILE UPDATE
  ================================================================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('firstName', user.firstName);
      formData.append('lastName', user.lastName);
      formData.append('phone', user.phone);
      formData.append('email', user.email);
      formData.append('detectedDisease', user.detectedDisease);

      if (image) {
        formData.append('image', image);
      }

      await dispatch(updateProfile(formData)).unwrap();
      await dispatch(getUser(user.token)).unwrap();
      
      setIsEdit(false);
      setImage(null);

    } catch (error) {
      console.log(error);
      toast.error(error.message || "Failed to update profile");
    }
  };

  /* ==================================================================
     HANDLE WEEK SELECTION
  ================================================================== */
  const handleWeekClick = (week) => {
    if (week > user.curWeek) {
      toast.error("Complete the current week's challenge to unlock this!");
    } else {
      dispatch(updateSelectedWeek(week));
    }
  };

  /* ==================================================================
     LOGOUT HANDLER
  ================================================================== */
  const handleLogout = () => {
    dispatch(clearToken());
    navigate('/');
  };

  /* ==================================================================
     CHART INITIALIZATION AND UPDATE
  ================================================================== */
  useEffect(() => {
    if (chartRef.current) {
      // Destroy existing chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const challengeLabels = [
        'Challenge 1',
        'Challenge 2',
        'Challenge 3',
        'Challenge 4',
        'Challenge 5',
        'Challenge 6',
        'Challenge 7'
      ];
      const selectedWeekData = user.scores[user.selectedWeek - 1] || [];

      chartInstance.current = new Chart(chartRef.current, {
        type: 'bar',
        data: {
          labels: challengeLabels,
          datasets: [{
            label: `Week ${user.selectedWeek} Challenge Scores`,
            data: selectedWeekData,
            backgroundColor: '#5f6FFF',
            borderColor: '#001aff',
            borderWidth: 1,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: 'Score (%)',
                color: '#ffffff',
                font: {
                  size: '20px',
                  weight: 'bold',
                  family: 'Poppins'
                }
              },
              ticks: {
                color: '#ffffff',
                font: {
                  size: '16px',
                  weight: 'medium',
                  family: 'Poppins'
                },
                stepSize: 10,
                autoSkip: false
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            },
            x: {
              ticks: {
                color: '#ffffff',
                font: {
                  size: '16px',
                  weight: 'medium',
                  family: 'Poppins'
                }
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: `Week ${user.selectedWeek} Performance`,
              color: '#ffffff',
              font: {
                size: '20px',
                weight: 'bold',
                family: 'Poppins'
              }
            },
            legend: {
              labels: {
                color: '#ffffff'
              }
            }
          }
        }
      });
    }

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [user.selectedWeek, user.scores]);

  /* ==================================================================
     CALCULATE AVERAGE ACCURACY
  ================================================================== */
  const calculateAverageAccuracy = () => {
    let sum = 0;
    let count = 0;

    for (let i = 0; i < user.curWeek; i++) {
      const maxChallenges = (i === user.curWeek - 1) ? user.curChallenge - 1 : 7;
      for (let j = 0; j < maxChallenges; j++) {
        sum += user.scores[i][j];
        count += 1;
      }
    }

    return count === 0 ? 0 : sum / count;
  };

  /* ==================================================================
     RENDER
  ================================================================== */
  return (
    <div className='max-w-[1280px] mx-auto pt-40'>
      
      {/* MY PROFILE SECTION */}
      <div className='relative flex flex-col gap-8 items-center bg-gray-900 px-6 py-4 rounded-2xl mx-6' style={{ boxShadow: '6px 6px 10px #0f0f0f' }}>
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className='bg-primary-green px-4 py-2 rounded-full absolute md:bottom-2 right-2 max-440px:px-2 max-440px:py-1 max-440px:text-sm text-black hover:scale-105 transition-all max-md:top-2'
        >
          Logout
        </button>

        {/* Header with Edit Button */}
        <div className='flex gap-4 items-center'>
          <h2 className='font-bold text-xl text-white'>My Profile:</h2>
          {!isEdit ? (
            <img
              onClick={() => setIsEdit(true)}
              src={assets.PencilIcon}
              className='w-6 cursor-pointer'
              alt="Edit"
            />
          ) : (
            <div
              onClick={handleSubmit}
              className='bg-primary-green text-white font-medium text-lg px-4 py-2 rounded-full cursor-pointer hover:scale-105 transition-all'
            >
              Submit
            </div>
          )}
        </div>

        {/* Profile Photo */}
        <div className='rounded-full overflow-hidden border border-black flex items-center relative'>
          <img
            src={image ? URL.createObjectURL(image) : user.photo}
            className='w-32 h-32 object-cover'
            alt="Profile"
          />
        </div>

        {/* Upload Photo (Edit Mode) */}
        {isEdit && (
          <div>
            <label
              htmlFor="image"
              className='bg-primary-blue text-white font-medium text-lg px-4 py-2 rounded-full cursor-pointer hover:scale-105 transition-all'
            >
              Upload Photo
            </label>
            <input
              onChange={(e) => setImage(e.target.files[0])}
              type="file"
              id='image'
              hidden
            />
          </div>
        )}

        {/* Profile Information - Row 1 */}
        <div className='flex justify-between w-full max-w-[1000px] flex-wrap gap-4'>
          <div className='flex-1 flex flex-col items-center min-w-[120px]'>
            <p className='text-[#969696] font-medium'>First Name:</p>
            {isEdit ? (
              <input
                className='bg-gray-100 border border-black text-xl font-bold max-w-60 text-center px-2 py-1 rounded'
                type="text"
                value={user.firstName}
                onChange={e => dispatch(setUser({ ...user, firstName: e.target.value }))}
              />
            ) : (
              <p className='font-bold text-xl text-white'>{user.firstName}</p>
            )}
          </div>

          <div className='flex-1 flex flex-col items-center min-w-[120px]'>
            <p className='text-[#b4b4b4] font-medium'>Last Name:</p>
            {isEdit ? (
              <input
                className='bg-gray-100 border border-black text-xl font-bold max-w-60 text-center px-2 py-1 rounded'
                type="text"
                value={user.lastName}
                onChange={e => dispatch(setUser({ ...user, lastName: e.target.value }))}
              />
            ) : (
              <p className='font-bold text-xl text-white'>{user.lastName}</p>
            )}
          </div>

          <div className='flex-1 flex flex-col items-center min-w-[220px]'>
            <p className='text-[#969696] font-medium'>Email:</p>
            {isEdit ? (
              <input
                className='bg-gray-100 border border-black text-xl font-bold max-w-60 text-center px-2 py-1 rounded'
                type="email"
                value={user.email}
                onChange={e => dispatch(setUser({ ...user, email: e.target.value }))}
              />
            ) : (
              <p className='font-bold text-xl text-white'>{user.email}</p>
            )}
          </div>
        </div>

        {/* Profile Information - Row 2 */}
        <div className='flex justify-between w-full max-w-[600px] gap-4'>
          <div className='flex-1 flex flex-col items-center'>
            <p className='text-[#969696] font-medium'>Phone No:</p>
            {isEdit ? (
              <input
                className='bg-gray-100 border border-black text-xl font-bold max-w-60 text-center px-2 py-1 rounded'
                type="text"
                value={user.phone}
                onChange={e => dispatch(setUser({ ...user, phone: e.target.value }))}
              />
            ) : (
              <p className='font-bold text-xl text-white'>{user.phone}</p>
            )}
          </div>

          <div className='flex-1 flex flex-col items-center'>
            <p className='text-[#969696] font-medium'>Diagnosed With:</p>
            {isEdit ? (
              <select
                className='bg-gray-100 border border-black text-xl font-bold max-w-60 text-center px-2 py-1 rounded'
                value={user.detectedDisease}
                onChange={e => dispatch(setUser({ ...user, detectedDisease: e.target.value }))}
              >
                <option value=''>No Disorder</option>
                <option value='Diabetic Retinopathy'>Diabetic Retinopathy</option>
                <option value='Glaucoma'>Glaucoma</option>
                <option value='Cataract'>Cataract</option>
              </select>
            ) : (
              <p className='font-bold text-xl text-primary-green'>
                {user.detectedDisease || 'No Disorder'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* CONSISTENCY SECTION */}
      <div>
        <p className='text-xl font-bold mt-20 px-4 text-white'>Consistency:</p>
        <ActivityGrid />
      </div>

      {/* BADGES SECTION */}
      <div className='px-4'>
        <p className='text-xl font-bold mt-20 mb-10 text-white'>Badges:</p>
        <div
          className='bg-gray-800/90 flex flex-wrap gap-8 justify-center px-6 py-6 rounded-3xl max-w-[1000px] mx-auto'
          style={{ boxShadow: '6px 6px 10px #0f0f0f' }}
        >
          {Array.from([1, 2, 3, 4]).map((_, i) => {
            const badge = user.badges[i];
            const name = badge ? `Badge${i + 1}` : null;

            return badge ? (
              <div key={i} className='w-[100px] h-[100px] rounded-[25px] border-white border-[4px] overflow-hidden'>
                <img src={assets[name]} className='scale-125' alt={`Badge ${i + 1}`} />
              </div>
            ) : (
              <div
                key={i}
                className='h-[100px] w-[100px] border-[4px] border-white text-white font-semibold rounded-[25px] flex items-center justify-center bg-gradient-to-b from-black to-gray-700'
              >
                Week {i + 1}
              </div>
            );
          })}
        </div>
      </div>

      {/* PROGRESS WEEK SELECTOR */}
      <div className="flex items-start gap-4 mt-20 justify-center px-4 text-white">
        <span className='text-xl font-bold'>Progress:</span>
        <div className='flex gap-4 flex-wrap max-440px:gap-2'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`p-2 rounded-md cursor-pointer w-[30px] h-[30px] inline-flex items-center justify-center transition-all hover:scale-110 ${
                i + 1 === user.selectedWeek
                  ? "bg-primary-blue text-white"
                  : i + 1 < user.curWeek
                  ? "bg-green-500 text-white"
                  : "bg-white text-black border border-black"
              }`}
              onClick={() => handleWeekClick(i + 1)}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* CHART SECTION */}
      <div
        className='border border-white rounded-2xl p-4 min-h-[400px] w-[800px] max-900px:w-[700px] max-md:w-[400px] max-440px:w-[350px]'
        style={{ margin: '20px auto', boxShadow: '6px 6px 10px #5e5e5e' }}
      >
        <canvas ref={chartRef}></canvas>
      </div>

      {/* AVERAGE ACCURACY SECTION */}
      <div className='mb-20 px-4'>
        <p className='text-xl font-bold mt-20 mb-10 text-white'>Your Average Accuracy so far:</p>
        <AnimatedCircularProgressBar
          max={100}
          min={0}
          value={calculateAverageAccuracy()}
          gaugePrimaryColor="rgb(79 70 229)"
          gaugeSecondaryColor="#8a8a8a"
          className="self-end w-48 h-48 mx-auto"
        />
      </div>

    </div>
  );
};

export default MyProfile;