export interface ExerciseTip {
	exercise: string;
	tips: string[];
	formCues: string[];
	commonMistakes: string[];
}

export const exerciseTips: Record<string, ExerciseTip> = {
	'Leg Press': {
		exercise: 'Leg Press',
		tips: [
			'Keep your lower back flat against the pad throughout the movement',
			'Push through your heels, not your toes, to maximize quad and glute activation',
			'Control the weight on the way down - don\'t let it drop'
		],
		formCues: [
			'Feet shoulder-width apart on the platform',
			'Knees track over toes, don\'t let them cave inward',
			'Don\'t lock out completely at the top to keep tension on muscles'
		],
		commonMistakes: [
			'Letting the lower back round at the bottom',
			'Bouncing the weight at the bottom',
			'Placing feet too high or too low on the platform'
		]
	},
	'Leg Extension (Machine)': {
		exercise: 'Leg Extension',
		tips: [
			'Focus on squeezing your quads at the top of the movement',
			'Use a controlled tempo - 2 seconds up, 2 seconds down',
			'Great for building the "teardrop" muscle above your knee'
		],
		formCues: [
			'Adjust the back pad so your knees align with the pivot point',
			'Keep your back against the pad throughout',
			'Point toes slightly outward to hit the outer quad'
		],
		commonMistakes: [
			'Using momentum to swing the weight up',
			'Not achieving full extension at the top',
			'Setting the pad too high or low on the shins'
		]
	},
	'Seated Row (Machine)': {
		exercise: 'Seated Row',
		tips: [
			'Initiate the pull with your back muscles, not your arms',
			'Squeeze your shoulder blades together at the peak contraction',
			'Keep your chest up and proud throughout the movement'
		],
		formCues: [
			'Sit tall with a slight arch in your lower back',
			'Pull the handles toward your lower chest/upper abdomen',
			'Keep elbows close to your body'
		],
		commonMistakes: [
			'Rounding the lower back',
			'Using too much bicep and not enough back',
			'Leaning too far back to cheat the weight'
		]
	},
	'Lat Pulldown (Machine)': {
		exercise: 'Lat Pulldown',
		tips: [
			'Think about pulling your elbows down to your sides',
			'Lean back slightly (about 15-20 degrees) for better lat engagement',
			'Vary your grip width to target different parts of your back'
		],
		formCues: [
			'Grip the bar just outside shoulder width',
			'Pull the bar to your upper chest, not behind your neck',
			'Keep your chest up and core engaged'
		],
		commonMistakes: [
			'Pulling the bar behind the neck (injury risk)',
			'Using body momentum to swing the weight',
			'Gripping too wide or too narrow'
		]
	},
	'Shoulder Press (Machine)': {
		exercise: 'Shoulder Press',
		tips: [
			'Press in a slight arc, not straight up',
			'Don\'t lock out at the top to maintain tension',
			'Control the negative portion for maximum shoulder development'
		],
		formCues: [
			'Keep your back flat against the pad',
			'Wrists stacked over elbows throughout',
			'Core tight to protect your lower back'
		],
		commonMistakes: [
			'Arching the lower back excessively',
			'Flaring elbows too wide',
			'Lowering the weight too fast'
		]
	},
	'Torso Rotation (Machine)': {
		exercise: 'Torso Rotation',
		tips: [
			'Move slowly and with control - this is not a power movement',
			'Focus on the obliques doing the work',
			'Use lighter weight than you think you need'
		],
		formCues: [
			'Keep your hips stationary - only your torso should rotate',
			'Maintain an upright posture',
			'Breathe out as you rotate'
		],
		commonMistakes: [
			'Using momentum instead of muscle control',
			'Rotating the hips along with the torso',
			'Going too heavy and straining the spine'
		]
	},
	'Back Extension (Machine)': {
		exercise: 'Back Extension',
		tips: [
			'Strengthen your lower back to support heavy compound lifts',
			'Squeeze your glutes at the top of the movement',
			'This exercise helps prevent lower back injuries'
		],
		formCues: [
			'Keep your spine neutral - don\'t hyperextend',
			'Cross arms over chest or behind head',
			'Control the descent, don\'t drop down'
		],
		commonMistakes: [
			'Hyperextending at the top (going too far back)',
			'Rounding the back on the way down',
			'Moving too quickly through reps'
		]
	},
	'Elliptical Machine': {
		exercise: 'Elliptical',
		tips: [
			'Great low-impact cardio option that\'s easy on joints',
			'Use the arm handles to engage your upper body',
			'Vary resistance and incline to challenge yourself'
		],
		formCues: [
			'Stand upright, don\'t lean on the handles',
			'Push through your heels for glute engagement',
			'Keep a steady, rhythmic pace'
		],
		commonMistakes: [
			'Leaning heavily on the handles (reduces calorie burn)',
			'Setting resistance too low',
			'Not using full range of motion'
		]
	}
};

export function getExerciseTip(exerciseName: string): ExerciseTip | null {
	return exerciseTips[exerciseName] || null;
}

export function getRandomTipForExercise(exerciseName: string): string | null {
	const tip = exerciseTips[exerciseName];
	if (!tip) return null;
	const allTips = [...tip.tips, ...tip.formCues];
	return allTips[Math.floor(Math.random() * allTips.length)];
}
