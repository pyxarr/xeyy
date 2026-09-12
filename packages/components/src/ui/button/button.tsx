import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import { Button as BaseButton } from '@base-ui/react/button';
import { semantic, radii, spacing } from '@xeyy/tokens/theme.stylex';

type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  focusableWhenDisabled?: boolean;
  nativeButton?: boolean;
  as?: React.ReactElement;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
  id?: string;
  name?: string;
  form?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean | 'true' | 'false';
  'aria-pressed'?: boolean | 'true' | 'false' | 'mixed';
  'aria-haspopup'?: boolean | 'true' | 'false' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
}

const spin = stylex.keyframes({
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
});

const styles = stylex.create({
    base: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[2],
        borderRadius: radii.md,
        fontWeight: '500',
        fontSize: '14px',
        lineHeight: '1',
        cursor: 'pointer',
        border: 'none',
        outline: 'none',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        transition: 'opacity 0.15s, background-color 0.15s',
        ':hover': {
            opacity: '0.9',
        },
        ':focus-visible': {
            outlineWidth: '2px',
            outlineStyle: 'solid',
            outlineColor: semantic.focusRing,
            outlineOffset: '2px',
        },
        '[data-disabled]': {
            opacity: '0.5',
            cursor: 'not-allowed',
            pointerEvents: 'none',
        },
    },

    // Variants set color/border only. `link` also overrides sizing, which is
    // why size is applied BEFORE variant in stylex.props() below — variant
    // needs the last word for that one case.
    primary: {
        backgroundColor: semantic.primary,
        color: semantic.primaryForeground,
    },
    secondary: {
        backgroundColor: semantic.surface,
        color: semantic.foreground,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: semantic.border,
    },
    destructive: {
        backgroundColor: semantic.destructive,
        color: semantic.destructiveForeground,
    },
    outline: {
        backgroundColor: 'transparent',
        color: semantic.foreground,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: semantic.border,
    },
    ghost: {
        backgroundColor: 'transparent',
        color: semantic.foreground,
        ':hover': {
            backgroundColor: semantic.surface,
            opacity: '1',
        },
    },
    link: {
        backgroundColor: 'transparent',
        color: semantic.primary,
        textDecoration: 'underline',
        textUnderlineOffset: '4px',
        height: 'auto',
        paddingInline: '0',
    },

    // Sizes
    sm: {
        height: '32px',
        paddingInline: spacing[3],
        fontSize: '13px',
        borderRadius: radii.sm,
    },
    md: {
        height: '40px',
        paddingInline: spacing[4],
        fontSize: '14px',
    },
    lg: {
        height: '48px',
        paddingInline: spacing[6],
        fontSize: '16px',
        borderRadius: radii.lg,
    },
    icon: {
        height: '40px',
        width: '40px',
        paddingInline: '0',
    },

    // States
    fullWidth: {
        width: '100%',
    },
    loading: {
        cursor: 'wait',
    },
});

const spinnerStyles = stylex.create({
    spinner: {
        width: '14px',
        height: '14px',
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: 'currentColor',
        borderTopColor: 'transparent',
        borderRadius: radii.full,
        animationName: spin,
        animationDuration: '0.6s',
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
    },
});

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    function Button(
        {
            variant = 'primary',
            size = 'md',
            loading = false,
            fullWidth = false,
            disabled,
            focusableWhenDisabled,
            nativeButton = true,
            as,
            children,
            ...props
        },
        ref,
    ) {
        const labelId = React.useId();

        return (
            <BaseButton
                {...props}
                ref={ref}
                render={as}
                nativeButton={nativeButton}
                disabled={disabled || loading}
                focusableWhenDisabled={loading || focusableWhenDisabled}
                aria-labelledby={loading ? labelId : props['aria-labelledby']}
                {...stylex.props(
                    styles.base,
                    styles[size],
                    styles[variant],
                    fullWidth && styles.fullWidth,
                    loading && styles.loading,
                )}
            >
                {loading ? (
                    <span {...stylex.props(spinnerStyles.spinner)} aria-hidden="true" />
                ) : null}

                <span id={loading ? labelId : undefined}>{children}</span>
            </BaseButton>
        );
    },
);