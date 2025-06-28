import { WidgetItemColors } from '@/lib/utils/widget-styling/types';
import { MarkdownHooks } from 'react-markdown';
import rehypePrettyCode from 'rehype-pretty-code';
import remarkCallout from 'remark-callout';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkWikiLink from 'remark-wiki-link';

interface MarkdownRendererProps {
    content: string;
    widgetColors?: WidgetItemColors;
    className?: string;
    variant?: 'card' | 'modal';
}

export const MarkdownRenderer = ({
    content,
    widgetColors,
    className = '',
    variant = 'card',
}: MarkdownRendererProps) => {
    const primaryTextColor = widgetColors?.primaryText ?? '#1F2937';
    const secondaryTextColor = widgetColors?.secondaryText ?? '#6B7280';
    const accentColor = widgetColors?.accent ?? '#1E40AF';

    // Different font sizes based on variant
    const fontSizes = {
        card: {
            h1: '1.125rem',
            h2: '1rem',
            h3: '0.875rem',
            code: '0.75rem',
        },
        modal: {
            h1: '1.5rem',
            h2: '1.25rem',
            h3: '1.125rem',
            code: '0.875rem',
        },
    };

    const sizes = fontSizes[variant];

    return (
        <div className={className}>
            <MarkdownHooks
                remarkPlugins={[
                    remarkGfm,
                    remarkCallout,
                    remarkDirective,
                    remarkMath,
                    remarkWikiLink,
                ]}
                rehypePlugins={[
                    [
                        rehypePrettyCode,
                        {
                            theme: 'ayu-dark',
                            keepBackground: false,
                        },
                    ],
                ]}
                components={{
                    p: ({ children }) => (
                        <p
                            style={{
                                color: secondaryTextColor,
                                margin: variant === 'modal' ? '0.5rem 0' : 0,
                            }}
                        >
                            {children}
                        </p>
                    ),
                    h1: ({ children }) => (
                        <h1
                            style={{
                                color: primaryTextColor,
                                fontSize: sizes.h1,
                                margin:
                                    variant === 'modal' ? '1rem 0 0.5rem 0' : 0,
                                fontWeight: '600',
                            }}
                        >
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2
                            style={{
                                color: primaryTextColor,
                                fontSize: sizes.h2,
                                margin:
                                    variant === 'modal'
                                        ? '0.75rem 0 0.375rem 0'
                                        : 0,
                                fontWeight: '600',
                            }}
                        >
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3
                            style={{
                                color: primaryTextColor,
                                fontSize: sizes.h3,
                                margin:
                                    variant === 'modal'
                                        ? '0.5rem 0 0.25rem 0'
                                        : 0,
                                fontWeight: '600',
                            }}
                        >
                            {children}
                        </h3>
                    ),
                    h4: ({ children }) => (
                        <h4
                            style={{
                                color: primaryTextColor,
                                fontSize:
                                    variant === 'modal' ? '1rem' : '0.8rem',
                                margin:
                                    variant === 'modal'
                                        ? '0.5rem 0 0.25rem 0'
                                        : 0,
                                fontWeight: '600',
                            }}
                        >
                            {children}
                        </h4>
                    ),
                    h5: ({ children }) => (
                        <h5
                            style={{
                                color: primaryTextColor,
                                fontSize:
                                    variant === 'modal'
                                        ? '0.875rem'
                                        : '0.75rem',
                                margin:
                                    variant === 'modal'
                                        ? '0.5rem 0 0.25rem 0'
                                        : 0,
                                fontWeight: '600',
                            }}
                        >
                            {children}
                        </h5>
                    ),
                    h6: ({ children }) => (
                        <h6
                            style={{
                                color: primaryTextColor,
                                fontSize:
                                    variant === 'modal' ? '0.75rem' : '0.7rem',
                                margin:
                                    variant === 'modal'
                                        ? '0.5rem 0 0.25rem 0'
                                        : 0,
                                fontWeight: '600',
                            }}
                        >
                            {children}
                        </h6>
                    ),
                    strong: ({ children }) => (
                        <strong style={{ color: primaryTextColor }}>
                            {children}
                        </strong>
                    ),
                    em: ({ children }) => (
                        <em style={{ color: primaryTextColor }}>{children}</em>
                    ),
                    code: ({ children }) => (
                        <code
                            style={{
                                color: accentColor,
                                padding:
                                    variant === 'modal'
                                        ? '0.25rem 0.375rem'
                                        : '0.125rem 0.25rem',
                                borderRadius: '0.25rem',
                                fontSize: sizes.code,
                            }}
                        >
                            {children}
                        </code>
                    ),
                    pre: ({ children }) => (
                        <pre
                            style={{
                                backgroundColor:
                                    widgetColors?.lightBackground ?? '#F3F4F6',
                                color: primaryTextColor,
                                padding:
                                    variant === 'modal' ? '1rem' : '0.5rem',
                                borderRadius: '0.375rem',
                                overflow: 'auto',
                                margin: variant === 'modal' ? '0.5rem 0' : 0,
                            }}
                        >
                            {children}
                        </pre>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote
                            style={{
                                borderLeft: `4px solid ${accentColor}`,
                                paddingLeft:
                                    variant === 'modal' ? '1rem' : '0.5rem',
                                margin: variant === 'modal' ? '0.5rem 0' : 0,
                                fontStyle: 'italic',
                                color: secondaryTextColor,
                            }}
                        >
                            {children}
                        </blockquote>
                    ),
                    ul: ({ children }) => (
                        <ul
                            style={{
                                color: secondaryTextColor,
                                margin: variant === 'modal' ? '0.5rem 0' : 0,
                                paddingLeft:
                                    variant === 'modal' ? '1.5rem' : '1rem',
                            }}
                        >
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol
                            style={{
                                color: secondaryTextColor,
                                margin: variant === 'modal' ? '0.5rem 0' : 0,
                                paddingLeft:
                                    variant === 'modal' ? '1.5rem' : '1rem',
                            }}
                        >
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => (
                        <li
                            style={{
                                color: secondaryTextColor,
                                margin: variant === 'modal' ? '0.25rem 0' : 0,
                            }}
                        >
                            {children}
                        </li>
                    ),
                    a: ({ children, href }) => (
                        <a
                            href={href}
                            style={{
                                color: accentColor,
                                textDecoration: 'underline',
                            }}
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            {children}
                        </a>
                    ),
                    table: ({ children }) => (
                        <table
                            style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                margin: variant === 'modal' ? '0.5rem 0' : 0,
                            }}
                        >
                            {children}
                        </table>
                    ),
                    th: ({ children }) => (
                        <th
                            style={{
                                border: `1px solid ${widgetColors?.border ?? '#E5E7EB'}`,
                                padding:
                                    variant === 'modal' ? '0.5rem' : '0.25rem',
                                backgroundColor:
                                    widgetColors?.lightBackground ?? '#F9FAFB',
                                color: primaryTextColor,
                                fontWeight: '600',
                            }}
                        >
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td
                            style={{
                                border: `1px solid ${widgetColors?.border ?? '#E5E7EB'}`,
                                padding:
                                    variant === 'modal' ? '0.5rem' : '0.25rem',
                                color: secondaryTextColor,
                            }}
                        >
                            {children}
                        </td>
                    ),
                    hr: () => (
                        <hr
                            style={{
                                border: 'none',
                                borderTop: `1px solid ${widgetColors?.border ?? '#E5E7EB'}`,
                                margin:
                                    variant === 'modal' ? '1rem 0' : '0.5rem 0',
                            }}
                        />
                    ),
                }}
            >
                {content}
            </MarkdownHooks>
        </div>
    );
};
