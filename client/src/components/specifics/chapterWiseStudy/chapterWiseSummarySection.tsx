
import AIOutput from '../AIOutput'

const ChapterWiseSummarySection = ({summary}) => {
  return (
   <div className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-lg p-4 border border-blue-500/10">
              <AIOutput content={summary} />
            </div>
  )
}

export default ChapterWiseSummarySection