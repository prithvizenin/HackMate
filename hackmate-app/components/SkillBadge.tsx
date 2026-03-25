const SkillBadge = ({ skill_name, proficiency }: { skill_name: string; proficiency: string }) => {
  const getColors = () => {
    switch(proficiency) {
      case 'Advanced': return 'bg-pink-400 text-black border-black';
      case 'Intermediate': return 'bg-cyan-400 text-black border-black';
      case 'Beginner': return 'bg-lime-400 text-black border-black';
      default: return 'bg-yellow-400 text-black border-black';
    }
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 text-xs font-black uppercase tracking-wider border-2 brutal-shadow ${getColors()}`}>
      {skill_name}
    </span>
  );
};

export default SkillBadge;
