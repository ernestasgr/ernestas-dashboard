import { Widget } from '@/generated/graphql';

interface CoordinateGridProps {
    showCoordinates: boolean;
    windowWidth: number;
    widgets: Widget[];
}

export const CoordinateGrid = ({ showCoordinates, windowWidth, widgets }: CoordinateGridProps) => {
    if (!showCoordinates) return null;

    const cols = 12;
    const rowHeight = 60;
    const margin = [10, 10]; // Same as react-grid-layout default margin
    const containerPadding = [0, 0]; // Same as react-grid-layout default containerPadding

    const availableWidth = windowWidth - containerPadding[0] * 2;
    const colWidth = (availableWidth - margin[0] * (cols - 1)) / cols;

    const maxY = widgets.reduce(
        (max, widget) => Math.max(max, widget.y + widget.height),
        0,
    );
    const minRows = Math.max(10, maxY + 2); // Show at least 10 rows, or enough to fit all widgets plus 2 extra
    const gridItems = [];
    const axisLabels = [];

    for (let col = 0; col < cols; col++) {
        const left = col * (colWidth + margin[0]);
        axisLabels.push(
            <div
                key={`col-header-${col.toString()}`}
                className='pointer-events-none absolute flex items-center justify-center border border-blue-300 bg-blue-100/90 font-mono text-sm font-bold text-blue-700'
                style={{
                    left: `${left.toString()}px`,
                    top: '-30px',
                    width: `${colWidth.toString()}px`,
                    height: '28px',
                    zIndex: 20,
                }}
            >
                {col}
            </div>,
        );
    }

    for (let row = 0; row < minRows; row++) {
        const top = row * (rowHeight + margin[1]);
        axisLabels.push(
            <div
                key={`row-header-${row.toString()}`}
                className='pointer-events-none absolute flex items-center justify-center border border-blue-300 bg-blue-100/90 font-mono text-sm font-bold text-blue-700'
                style={{
                    left: '-40px',
                    top: `${top.toString()}px`,
                    width: '38px',
                    height: `${rowHeight.toString()}px`,
                    zIndex: 20,
                }}
            >
                {row}
            </div>,
        );
    }

    for (let row = 0; row < minRows; row++) {
        for (let col = 0; col < cols; col++) {
            const left = col * (colWidth + margin[0]);
            const top = row * (rowHeight + margin[1]);
            gridItems.push(
                <div
                    key={`grid-${row.toString()}-${col.toString()}`}
                    className='pointer-events-none absolute border border-slate-300/40 bg-slate-100/20'
                    style={{
                        left: `${left.toString()}px`,
                        top: `${top.toString()}px`,
                        width: `${colWidth.toString()}px`,
                        height: `${rowHeight.toString()}px`,
                    }}
                />,
            );
        }
    }

    return (
        <div
            className='pointer-events-none absolute inset-0 z-0'
            style={{ marginTop: '30px', marginLeft: '40px' }}
        >
            <div className='absolute inset-0'>{axisLabels}</div>
            <div className='absolute inset-0'>{gridItems}</div>
            <div
                className='pointer-events-none absolute flex items-center justify-center border border-blue-400 bg-blue-200/90 font-mono text-xs font-bold text-blue-800'
                style={{
                    left: '-40px',
                    top: '-30px',
                    width: '38px',
                    height: '28px',
                    zIndex: 25,
                }}
            >
                X,Y
            </div>
        </div>
    );
};
