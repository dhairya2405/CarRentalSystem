import Booking from "../models/Booking.js"
import Car from "../models/Car.js";

// Check car availablity
const checkAvailablity = async(car,pickupDate,returnDate)=>{
    const bookings = await Booking.find({
        car,pickupDate:{$lte:returnDate},returnDate:{$gte:pickupDate}

    })

    return bookings.length === 0;
}

//API to Check Availablity of Cars for given Date and Location
export const checkAvailablityOfCar = async(req,res) => {
    try{
    const {location,pickupDate,returnDate} = req.body
    // fetch all available cars for given location      
    const cars = await Car.find({location,isAvailable:true})

    // Check car availablity for given date range using promise 
    const availableCarsPromises =  cars.map(async(car)=>{
      const isAvailable = await checkAvailablity(car._id,pickupDate,returnDate)
      return{...car._doc,isAvailable:isAvailable}
    })

    let availableCars = await Promise.all(availableCarsPromises);
    availableCars = availableCars.filter(car=>car.isAvailable === true)

    res.json({success:true,availableCars})
    
    }
    catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}

export const createBooking = async(req,res)=>{
    try{
        const {_id} = req.user;
        const {car,pickupDate,returnDate} = req.body;
        
        console.log('Booking request:', {car, pickupDate, returnDate, userId: _id});

        const isAvailable = await checkAvailablity(car,pickupDate,returnDate)
        if(!isAvailable){
            return res.json({success:false,message:"Car is not available for selected dates"})
        }

        const carData  = await Car.findById(car)
        
        if (!carData) {
            return res.json({success:false,message:"Car not found"})
        }
        
        console.log('Car data:', {carId: carData._id, pricePerDay: carData.pricePerDay, owner: carData.owner});

        // Calculate price based on pickupdate and returndate
        const picked = new Date(pickupDate);
        const returned = new Date(returnDate);  
        
        // Validate dates
        if (isNaN(picked.getTime()) || isNaN(returned.getTime())) {
            return res.json({success:false,message:"Invalid date format"})
        }
        
        if (picked >= returned) {
            return res.json({success:false,message:"Return date must be after pickup date"})
        }
        
        const noOfDays = Math.ceil((returned-picked)/(1000*60*60*24))
        
        console.log('Date calculation:', {picked, returned, noOfDays, pricePerDay: carData.pricePerDay});
        
        // Validate pricePerDay
        if (!carData.pricePerDay || isNaN(carData.pricePerDay) || carData.pricePerDay <= 0) {
            return res.json({success:false,message:"Invalid car price configuration"})
        }
        
        const price = carData.pricePerDay * noOfDays;
        
        console.log('Final price calculation:', {price, noOfDays, pricePerDay: carData.pricePerDay});

        await Booking.create({car,owner:carData.owner,user:_id,pickupDate,returnDate,price})

        res.json({success:true,message:"Booking Created"})
    }
    catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}

//API to List User Bookings
export const getUserBookings = async(req,res)=>{
    try{
        const {_id} = req.user;
        const bookings = await Booking.find({user:_id}).populate("car").sort({createdAt:-1})
        res.json({success:true,bookings})
    }
    catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}

// API to get Owner Bookings 
export const getOwnerBookings = async(req,res)=>{
    try{
        if(req.user.role !== 'owner'){
            return res.json({success:false,message:"UnAuthorized"})
        }
        const bookings = await Booking.find({owner:req.user._id}).populate('car user').select("-user.password").sort({createdAt:-1})
        res.json({success:true,bookings})

    }
    catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}

// API to change Booking status
export const changeBookingStatus = async(req,res)=>{
    try{
        const {_id} = req.user;
        const {bookingId,status} = req.body
        const booking = await Booking.findById(bookingId)
        
        if(booking.owner.toString() !== _id.toString()){
            return res.json({success:false,message:"Unauthorized to change this booking status"})
        }

        booking.status = status;
        await booking.save();

        res.json({success:true,message:"Booking status updated successfully"})
    }
    catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}