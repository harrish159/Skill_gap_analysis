const Assessment = require("../schemas/AssessmentSchema");
const SkillGap = require("../schemas/SkillGapSchema");
const SkillMapping = require("../schemas/SkillMappingSchema");

const calculateSkillGap = async (req, res) => {
  try {
    const { assessmentId } = req.body;

    // 1. Fetch assessment
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    const facultyId = assessment.facultyId;
    // console.log(assessment);
    const gaps = [];

    // 2. Loop through faculty ratings
    for (let rating of assessment.skillRatings) {
      const { skillId, selfRating } = rating;
      console.log(skillId, selfRating);
      // Fetch required rating from SkillMapping
      const mapping = await SkillMapping.findOne({
        skillId,
      });
      console.log(mapping);
      if (!mapping) 
        {
          console.log("Skill is Not Mapped Bye..")
          continue; // skip if no mapping
        }

      const currentRating = selfRating;
      const requiredRating = mapping.requiredRating;

      const gapScore = Math.max(requiredRating - currentRating, 0);
      console.log("GapScore : "+gapScore);

      let gapSeverity = "low";
      if (gapScore >= 3) gapSeverity = "high";
      else if (gapScore >= 1) gapSeverity = "medium";

      if (gapScore > 0) {
        gaps.push({
          skillId: rating.skillId,
          requiredRating,
          currentRating,
          gapScore,
          gapSeverity,
        });
      }
    }

    // 3. Save skill gap
    const skillGap = await SkillGap.create({
      facultyId,
      assessmentId,
      gaps,
      totalGaps: gaps.length,
    });

    res.status(201).json(skillGap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { calculateSkillGap };
